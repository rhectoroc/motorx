// @ts-nocheck
import { AsyncLocalStorage } from 'node:async_hooks';
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

import MyAdapter from './adapter';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = MyAdapter(pool);
const app = new Hono();

app.use(requestId());
app.use(contextStorage());

// 🔥 CORRECCIÓN AQUÍ: Aseguramos que la función siempre retorne el objeto
initAuthConfig(app, (c) => {
  const config = {
    secret: process.env.AUTH_SECRET || 'una-clave-muy-secreta-de-respaldo',
    adapter: adapter,
    trustHost: true,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await adapter.getUserByEmail(credentials.email);
          if (!user) return null;

          const matchingAccount = user.accounts?.find(a => a.provider === 'credentials');
          if (!matchingAccount?.password) return null;

          const isValid = await verify(matchingAccount.password, credentials.password);
          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role // Vital para el dashboard
            };
          }
          return null;
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.role = user.role;
        return token;
      },
      async session({ session, token }) {
        if (session.user) session.user.role = token.role;
        return session;
      },
    },
    pages: {
      signIn: '/account/signin',
    },
  };
  return config; // <--- IMPRESCINDIBLE: retornar el objeto
});

// Manejador de rutas Auth
app.use('/api/auth/*', async (c, next) => {
  if (!isAuthAction(c.req.path)) return next();
  const handler = authHandler();
  return handler(c);
});

app.use(cors());
app.route(API_BASENAME, api);

export default createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});