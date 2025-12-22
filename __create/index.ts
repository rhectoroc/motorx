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

// Importaciones locales
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

const app = new Hono();

// Middlewares estándar
app.use('*', requestId());
app.use('*', (c, next) => {
  const reqId = c.get('requestId');
  return als.run({ requestId: reqId }, () => next());
});
app.use(contextStorage());

// Manejo de errores para evitar que el frontend reciba HTML de error (Unexpected token <)
app.onError((err, c) => {
  console.error("Hono Server Error:", err);
  if (c.req.path.startsWith('/api/')) {
    return c.json({ 
      error: 'Internal Server Error', 
      details: process.env.NODE_ENV === 'development' ? serializeError(err) : undefined 
    }, 500);
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

// Configuración de CORS
if (process.env.CORS_ORIGINS) {
  app.use('/*', cors({ origin: process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) }));
}

/**
 * CONFIGURACIÓN DE AUTENTICACIÓN
 * Se envuelve en una función para que el Pool no bloquee el build de Docker
 */
if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', initAuthConfig((c) => {
    // Inicializamos el Pool solo cuando hay una petición real
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = NeonAdapter(pool);

    return {
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
            try {
              if (!credentials?.email || !credentials?.password) return null;

              const user = await adapter.getUserByEmail(credentials.email as string);
              
              if (user && user.accounts && user.accounts.length > 0) {
                const passwordHash = user.accounts.find((a: any) => a.provider === 'credentials')?.password;
                
                if (passwordHash && await verify(passwordHash, credentials.password as string)) {
                  return {
                    id: user.id.toString(), // Compatible con UUID o Serial
                    name: user.name,
                    email: user.email,
                    role: user.role || 'admin'
                  };
                }
              }
              return null;
            } catch (dbError) {
              console.error("Auth DB Error:", dbError);
              return null;
            }
          }
        })
      ],
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.role = (user as any).role;
            token.sub = user.id;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            (session.user as any).role = token.role;
            (session.user as any).id = token.sub;
          }
          return session;
        }
      }
    };
  }));

  app.all('/api/auth/*', (c) => authHandler()(c));
}

/**
 * RUTAS DE API Y SERVIDOR
 */
// Montaje de las rutas del backend (incluye perfil, usuarios, etc)
app.route(API_BASENAME, api);

// Servidor Hono optimizado para Node.js
await createHonoServer({ app, defaultLogger: false });