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
import { API_BASENAME, api } from './route-builder';

// 1. Configuración de Base de Datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = MyAdapter(pool);
const app = new Hono();

// Middlewares base
app.use(requestId());
app.use(contextStorage());
app.use(cors());

// 2. CONFIGURACIÓN DE AUTH - FUERZA BRUTA
// Definimos el secreto con un fallback inmediato para evitar que sea undefined
const AUTH_SECRET = process.env.AUTH_SECRET || "secreto_temporal_de_emergencia_1234567890";

const getAuthConfig = (c) => ({
  secret: AUTH_SECRET,
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
        
        try {
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
});

// 🔥 ESTO ES LO MÁS IMPORTANTE:
// Inicializamos la configuración pasando la función directamente.
initAuthConfig(app, getAuthConfig);

// 3. MANEJADOR DE RUTAS AUTH
// En lugar de usar middlewares complejos, interceptamos todas las peticiones a /api/auth
app.all('/api/auth/*', async (c) => {
  // authHandler() devuelve una función que maneja la petición
  const handler = authHandler();
  return await handler(c);
});

// 4. RUTAS DE LA API
app.route(API_BASENAME, api);

// 5. SETUP DE ADMIN (AUXILIAR)
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
    } as any);

    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: userId,
      extraData: { password: hashedPassword },
    } as any);

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});