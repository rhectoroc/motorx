// @ts-nocheck
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
import { API_BASENAME, api, registerRoutes } from './route-builder';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = MyAdapter(pool);
const app = new Hono();

app.use('*', requestId());
app.use('*', contextStorage());
app.use('*', cors());

// 1. CONFIGURACIÓN DE AUTH COMO MIDDLEWARE (CORREGIDO)
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET || "secreto_temporal_de_emergencia_1234567890",
  adapter: adapter,
  trustHost: true,
  basePath: '/api/auth',
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await adapter.getUserByEmail(credentials.email);
          if (!user) return null;

          const matchingAccount = user.accounts?.find(a => a.provider === 'credentials');
          // Buscamos la contraseña (debe estar en el nivel superior de la cuenta)
          if (!matchingAccount?.password) return null;

          const isValid = await verify(matchingAccount.password, credentials.password);
          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role || 'client'
            };
          }
        } catch (e) {
          console.error("Error en authorize:", e);
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
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/account/signin',
  },
  skipCSRFCheck: skipCSRFCheck
})));

app.all('/api/auth/:action', async (c) => authHandler()(c));
app.all('/api/auth/:action/:provider', async (c) => authHandler()(c));

// 2. REGISTRO DE RUTAS DINÁMICAS
await registerRoutes();
app.route(API_BASENAME, api);

// 3. SETUP DE ADMIN CORREGIDO (Guardar contraseña correctamente)
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    const userId = crypto.randomUUID();
    const hashedPassword = await hash(password);

    const newUser = await adapter.createUser({
      id: userId,
      name,
      email,
      emailVerified: new Date(),
      role: 'admin'
    });

    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: userId,
      password: hashedPassword, // Guardamos directamente aquí para que authorize lo encuentre
    });

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});