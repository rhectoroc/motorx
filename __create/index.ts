import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import pg from 'pg';
import { verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';

// Importamos el adaptador y las rutas dinámicamente
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { API_BASENAME, api } from './route-builder';

const { Pool } = pg;
const als = new AsyncLocalStorage<{ requestId: string }>();

// Logger trazable para depuración en Easypanel
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

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);

const app = new Hono();

// Middlewares base
app.use('*', requestId());
app.use('*', (c, next) => {
  const reqId = c.get('requestId');
  return als.run({ requestId: reqId }, () => next());
});
app.use(contextStorage());

// Manejo de errores global (evita responder HTML cuando se espera JSON)
app.onError((err, c) => {
  console.error("Hono Server Error:", err);
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Internal Server Error', details: serializeError(err) }, 500);
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

// Configuración de CORS
if (process.env.CORS_ORIGINS) {
  app.use('/*', cors({ origin: process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) }));
}

/**
 * CONFIGURACIÓN DE AUTH.JS (Hono Integration)
 */
if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', initAuthConfig((c) => ({
    secret: process.env.AUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true,
    skipCSRFCheck,
    session: { strategy: 'jwt' },
    providers: [
      Credentials({
        id: 'credentials-signin',
        name: 'Credentials',
        authorize: async (credentials) => {
          if (!credentials?.email || !credentials?.password) return null;

          // Buscamos al usuario usando el adaptador (que ya maneja UUID)
          const user = await adapter.getUserByEmail(credentials.email as string);
          
          if (user && user.accounts && user.accounts.length > 0) {
            const passwordHash = user.accounts.find((a: any) => a.provider === 'credentials')?.password;
            
            if (passwordHash) {
              const isValid = await verify(passwordHash, credentials.password as string);
              if (isValid) {
                return {
                  id: user.id, // UUID de la tabla auth_users
                  name: user.name,
                  email: user.email,
                  role: user.role || 'admin'
                };
              }
            }
          }
          return null;
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = (user as any).role;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).id = token.id;
        }
        return session;
      }
    }
  })));

  app.all('/api/auth/*', (c) => authHandler()(c));
}

/**
 * RUTAS DE API Y SERVIDOR
 */
// Montamos las rutas de la API (incluyendo /api/user/profile)
app.route(API_BASENAME, api);

// Iniciamos el servidor
await createHonoServer({ app, defaultLogger: false });