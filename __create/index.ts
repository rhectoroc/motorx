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

import MyAdapter from './adapter'; // Tu adaptador personalizado
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

// 1. Conexión a tu contenedor Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Inicializamos el adaptador con el pool estándar de pg
const adapter = MyAdapter(pool);

const app = new Hono();

app.use(requestId());
app.use(contextStorage());

// 2. Consolidación de Auth.js
initAuthConfig(app, (c) => ({
  secret: process.env.AUTH_SECRET,
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

        // Buscamos el usuario directamente en tu Postgres
        const user = await adapter.getUserByEmail(credentials.email as string);
        if (!user) return null;

        // Extraemos la contraseña de la tabla auth_accounts
        const matchingAccount = user.accounts?.find(
          (a: any) => a.provider === 'credentials'
        );
        
        if (!matchingAccount?.password) return null;

        const isValid = await verify(matchingAccount.password, credentials.password as string);
        
        if (isValid) {
          // 🔥 AQUÍ ESTÁ LA CLAVE: Inyectamos el rol de la DB al objeto de Auth.js
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role // Este valor viene de tu columna 'role' en auth_users
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // El rol pasa del objeto 'user' (retornado en authorize) al Token JWT
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // El rol pasa del Token JWT a la Sesión que lee el Frontend (React Router)
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/signin',
  },
}));

// 3. Manejo de Rutas
app.use('/api/auth/*', async (c, next) => {
  if (!isAuthAction(c.req.path)) return next();
  return authHandler()(c);
});

app.use(cors());

// Ruta de emergencia para crear un admin en tu contenedor
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
      role: 'admin' // Forzado
    });

    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: userId,
      extraData: { password: hashedPassword },
    });

    return c.json({ success: true, message: "Admin creado en Postgres" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.route(API_BASENAME, api);

export default createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});