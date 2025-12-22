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

// 1. SOLUCIÓN AL ERROR "master": Forzamos la base de datos 'mx'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: 'mx', // 👈 Esto obliga a usar la DB correcta
  ssl: false,
});

const adapter = MyAdapter(pool);
const app = new Hono();

app.use('*', requestId());
app.use('*', contextStorage());
app.use('*', cors());

// 2. CONFIGURACIÓN DE AUTH.JS (Tu lógica original que funcionaba)
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET,
  adapter: adapter,
  trustHost: true,
  basePath: '/api/auth',
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
          // Buscamos usando el adapter que ya maneja las comillas dobles
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
  },
  pages: { signIn: '/account/signin' },
  skipCSRFCheck: skipCSRFCheck
})));

app.all('/api/auth/:action', async (c) => authHandler()(c));
app.all('/api/auth/:action/:provider', async (c) => authHandler()(c));

// 3. REGISTRO DE RUTAS DINÁMICAS
await registerRoutes();
app.route(API_BASENAME, api);

// 4. SERVIdOR DE REACT ROUTER (Recupera la interfaz original)
// 'createHonoServer' detecta automáticamente la carpeta 'build' tras el comando 'react-router build'
const server = createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

export default server;