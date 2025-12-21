import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import pg from 'pg';
const { Pool } = pg;
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';

import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
// @ts-ignore - Evita advertencia si el archivo es .js o no tiene tipos definidos
import { isAuthAction } from './is-auth-action';
// @ts-ignore
import { API_BASENAME, api } from './route-builder';

// Definición de tipos para Hono (Elimina errores de c.get('requestId'))
type Variables = {
  requestId: string;
};

const als = new AsyncLocalStorage<{ requestId: string }>();

// Logger con Trace ID
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

// Configuración de Base de Datos Estándar (pg)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// @ts-ignore
const adapter = NeonAdapter(pool);

const app = new Hono<{ Variables: Variables }>();

// Middlewares Base
app.use('*', requestId());
app.use('*', async (c, next) => {
  const reqId = c.get('requestId');
  return als.run({ requestId: reqId }, () => next());
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

// 1. Configuración de Autenticación
if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true,
    pages: { 
      signIn: '/account/signin', 
      signOut: '/account/logout' 
    },
    skipCSRFCheck,
    session: { strategy: 'jwt' },
    providers: [
      Credentials({
        id: 'credentials-signin',
        authorize: async (credentials) => {
          const { email, password } = credentials;
          // @ts-ignore
          const user = await adapter.getUserByEmail(email as string);
          if (!user) return null;
          // @ts-ignore
          const matchingAccount = user.accounts.find(a => a.provider === 'credentials');
          if (!matchingAccount?.password) return null;
          const isValid = await verify(matchingAccount.password, password as string);
          return isValid ? user : null;
        }
      })
    ]
  })));

  app.all('/api/auth/*', async (c) => {
    const handler = authHandler();
    return handler(c);
  });
}

// 2. Ruta para Admin Setup
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    
    // Generación de ID manual
    const userId = crypto.randomUUID();

    // @ts-ignore
    const newUser = await adapter.createUser({
      id: userId,
      name,
      email,
      emailVerified: new Date(),
    });

    // @ts-ignore
    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: newUser.id,
      extraData: { password: await hash(password) },
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Error en admin-setup:', err);
    return c.json({ error: 'Error al crear administrador', details: err.message }, 500);
  }
});

// 3. Montaje de API del Dashboard
app.route(API_BASENAME, api);

// Inicio del servidor
await createHonoServer({
  app,
  defaultLogger: false,
});