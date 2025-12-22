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
import { API_BASENAME, api } from './route-builder';

const als = new AsyncLocalStorage<{ requestId: string }>();

// Logger trazable
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
 * CONFIGURACIÓN DE AUTENTICACIÓN
 */
if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true,
    skipCSRFCheck,
    session: { strategy: 'jwt' },
    providers: [
      Credentials({
        id: 'credentials-signin',
        authorize: async (credentials) => {
          const user = await adapter.getUserByEmail(credentials.email as string);
          if (user && user.accounts[0]?.password) {
            const isValid = await verify(user.accounts[0].password, credentials.password as string);
            if (isValid) return { id: user.id.toString(), name: user.name, email: user.email, role: user.role || 'admin' };
          }
          return null;
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.role = (user as any).role;
        return token;
      },
      async session({ session, token }) {
        if (session.user) (session.user as any).role = token.role;
        return session;
      }
    }
  })));

  app.all('/api/auth/*', (c) => authHandler()(c));
}

// Montaje de APIs (Esto incluye automáticamente src/app/api/user/profile/route.js)
app.route(API_BASENAME, api);

await createHonoServer({ app, defaultLogger: false });