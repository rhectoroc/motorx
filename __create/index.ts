import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
//import { Pool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
const { Pool } = pg;
import { hash, verify } from 'argon2'; // Asegurado el import de hash
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);
  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);

const app = new Hono();

app.use('*', requestId());
app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});
app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json({ error: 'An error occurred', details: serializeError(err) }, 500);
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use('/*', cors({ origin: process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) }));
}

// Bloque de Autenticación Principal
if (process.env.AUTH_SECRET) {
  app.use('*', initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    pages: { signIn: '/account/signin', signOut: '/account/logout' },
    skipCSRFCheck,
    session: { strategy: 'jwt' },
    providers: [
      Credentials({
        id: 'credentials-signin',
        authorize: async (credentials) => {
          const { email, password } = credentials;
          const user = await adapter.getUserByEmail(email as string);
          if (!user) return null;
          const matchingAccount = user.accounts.find(a => a.provider === 'credentials');
          if (!matchingAccount?.password) return null;
          const isValid = await verify(matchingAccount.password, password as string);
          return isValid ? user : null;
        }
      })
    ]
  })));
  app.all('/api/auth/*', authHandler());
}

// RUTA PARA ADMIN SETUP (Agregada para resolver el error del POST)
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    const newUser = await adapter.createUser({
      id: crypto.randomUUID(),
      name,
      email,
      emailVerified: new Date(),
    });
    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: newUser.id,
      extraData: { password: await hash(password) }, // Hasheo correcto
    });
    return c.json({ success: true });
  } catch (err) {
    console.error('Error en admin-setup:', err);
    return c.json({ error: 'Error al crear administrador' }, 500);
  }
});

// Middlewares de Auth y API (En el orden correcto para evitar UnknownAction)
app.use('/api/auth/*', async (c, next) => {
  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  return next();
});

app.route(API_BASENAME, api);

// SE QUITA EL EXPORT DEFAULT para evitar error de puerto ocupado
await createHonoServer({
  app,
  defaultLogger: false,
});