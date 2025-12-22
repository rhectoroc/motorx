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
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

const als = new AsyncLocalStorage<{ requestId: string }>();

// Logger con trazabilidad
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

// Middlewares Base
app.use('*', requestId());
app.use('*', (c, next) => {
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

/**
 * BLOQUE DE AUTENTICACIÓN UNIFICADO
 * Se eliminó la redundancia de 'app.use' y 'app.all' dispersos.
 */
if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true, // Necesario para Easypanel
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
          
          if (isValid) {
            // Retornamos el usuario con el rol explícito para el frontend
            return { ...user, role: 'admin' };
          }
          return null;
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = (user as any).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).role = token.role;
        }
        return session;
      }
    }
  })));

  // Único manejador de rutas Auth
  app.all('/api/auth/*', (c) => authHandler()(c));
}

// RUTA PARA ADMIN SETUP
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
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
      providerAccountId: userId,
      extraData: { password: await hash(password) },
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Error en admin-setup:', err);
    return c.json({ error: 'Error al crear administrador', details: err.message }, 500);
  }
});

// Montaje de APIs del sistema (vienen de route-builder.ts)
app.route(API_BASENAME, api);

// Inicialización del servidor
await createHonoServer({
  app,
  defaultLogger: false,
});