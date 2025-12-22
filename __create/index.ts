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

// 1. Configuración de Base de Datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = MyAdapter(pool);
const app = new Hono();

app.use(requestId());
app.use(contextStorage());
app.use(cors());

// 2. Definición Robusta de la Configuración
// Forzamos un fallback para el secret para evitar el error de 'undefined' durante la carga
const authConfig = {
  secret: process.env.AUTH_SECRET || 'a-very-long-secret-key-that-prevents-initialization-errors',
  adapter: adapter,
  trustHost: true,
  skipCSRFCheck: skipCSRFCheck,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await adapter.getUserByEmail(credentials.email as string);
        if (!user) return null;

        const matchingAccount = user.accounts?.find(
          (a: any) => a.provider === 'credentials'
        );
        
        if (!matchingAccount?.password) return null;

        const isValid = await verify(matchingAccount.password, credentials.password as string);
        
        if (isValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'client' // Inyectamos el rol desde la DB
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/signin',
  },
};

// 3. Inicialización Inmediata
initAuthConfig(app, () => authConfig);

// 4. Manejador de Rutas de Autenticación
// Usamos .all para capturar todos los métodos (GET/POST) de Auth.js
app.all('/api/auth/*', (c) => {
  const handler = authHandler();
  return handler(c);
});

// 5. Rutas de la API y Setup
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

    return c.json({ success: true, message: "Admin creado correctamente" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.route(API_BASENAME, api);

// 6. Inicio del Servidor
export default createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});