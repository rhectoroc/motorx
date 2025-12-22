// __create/index.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import pg from 'pg';
import { verify } from 'argon2';
import { Hono } from 'hono';
import { createHonoServer } from 'react-router-hono-server/node';
import NeonAdapter from './adapter';
import { API_BASENAME, api } from './route-builder';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = NeonAdapter(pool);
const app = new Hono();

if (process.env.AUTH_SECRET) {
  app.use('/api/auth/*', initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true,
    skipCSRFCheck,
    providers: [
      Credentials({
        id: 'credentials-signin',
        authorize: async (credentials) => {
          const user = await adapter.getUserByEmail(credentials.email as string);
          if (user && await verify(user.accounts[0]?.password, credentials.password as string)) {
            return { id: user.id.toString(), name: user.name, email: user.email, role: user.role || 'admin' };
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

// Importante: El orden importa. Las APIs van antes del servidor de archivos.
app.route(API_BASENAME, api);

await createHonoServer({ app, defaultLogger: false });