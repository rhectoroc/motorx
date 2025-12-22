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

// Configuración de Auth corregida como Middleware
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET || "secreto_minimo_32_caracteres_de_emergencia",
  adapter: adapter,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await adapter.getUserByEmail(credentials.email as string);
          if (!user) return null;

          const matchingAccount = user.accounts?.find(a => a.provider === 'credentials');
          if (!matchingAccount?.password) return null;

          const isValid = await verify(matchingAccount.password, credentials.password as string);
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
      if (user) (token as any).role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) (session.user as any).role = (token as any).role;
      return session;
    },
  },
  pages: {
    signIn: '/account/signin',
  },
  skipCSRFCheck: skipCSRFCheck
})));

// Manejador centralizado de Auth
app.all('/api/auth/*', (c) => authHandler()(c));

// Registro de rutas dinámicas antes de montar la API
await registerRoutes();
app.route(API_BASENAME, api);

// Endpoint auxiliar de setup
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
      password: hashedPassword
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