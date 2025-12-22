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

// CONFIGURACIÓN DE AUTH.JS
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET || "secreto_temporal_de_emergencia_1234567890",
  adapter: adapter,
  trustHost: true, 
  basePath: '/api/auth',
  // IMPORTANTE: Forzamos el uso de cookies seguras solo si hay HTTPS
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await adapter.getUserByEmail(credentials.email as string);
          if (!user) return null;

          const accounts = await adapter.getAccountsByUserId(user.id);
          const matchingAccount = accounts.find(a => a.provider === 'credentials');
          
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
    async redirect({ url, baseUrl }) {
      // Forzamos el dashboard si el login es exitoso
      if (url.includes('/signin')) return `${baseUrl}/dashboard`;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: { signIn: '/account/signin' },
  skipCSRFCheck: skipCSRFCheck
})));

app.all('/api/auth/:action', async (c) => authHandler()(c));
app.all('/api/auth/:action/:provider', async (c) => authHandler()(c));

await registerRoutes();
app.route(API_BASENAME, api);

// SETUP DE ADMIN
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    const hashedPassword = await hash(password);
    let user = await adapter.getUserByEmail(email);
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      userId = crypto.randomUUID();
      user = await adapter.createUser({
        id: userId,
        name,
        email,
        emailVerified: new Date(),
        role: 'admin'
      });
    }

    await adapter.linkAccount({
      userId: userId,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: userId,
      password: hashedPassword, 
    });

    return c.json({ success: true, message: "Admin actualizado" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

const server = createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

export default server;