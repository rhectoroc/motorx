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

// 1. CONEXIÓN A LA DB 'mx'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: 'mx', 
  ssl: false,
});

const adapter = MyAdapter(pool);
const app = new Hono();

app.use('*', requestId());
app.use('*', contextStorage());
app.use('*', cors());

// 2. CONFIGURACIÓN DE AUTH.JS
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET,
  adapter: adapter,
  trustHost: true,
  basePath: '/api/auth',
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
          if (isValid) return { id: user.id, name: user.name, email: user.email, role: user.role || 'admin' };
        } catch (e) { console.error(e); }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = user.role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.role = token.role; session.user.id = token.id; }
      return session;
    },
  },
  pages: { signIn: '/account/signin' },
  skipCSRFCheck: skipCSRFCheck
})));

app.all('/api/auth/:action', async (c) => authHandler()(c));
app.all('/api/auth/:action/:provider', async (c) => authHandler()(c));

// 3. REGISTRO DE RUTAS
await registerRoutes();
app.route(API_BASENAME, api);

// 4. RUTA PARA EL FORMULARIO DE ADMIN-SETUP
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    
    // Verificamos si ya existe para evitar duplicados o errores de UNIQUE
    const existingUser = await adapter.getUserByEmail(email);
    if (existingUser) {
      return c.json({ success: false, error: "Este usuario ya existe en la base de datos." }, 400);
    }

    const hashedPassword = await hash(password);
    
    // Insertamos manualmente para asegurar que el ID sea numérico (SERIAL)
    // y no un UUID que cause el error de sintaxis
    const userRes = await pool.query(
      `INSERT INTO auth_users (name, email, role, "emailVerified") 
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [name, email, 'admin']
    );
    const newUser = userRes.rows[0];

    // Vinculamos la cuenta usando el ID numérico
    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: newUser.id.toString(),
      password: hashedPassword, 
    });

    return c.json({ success: true, message: "¡Admin creado! Ya puedes iniciar sesión." });
  } catch (err: any) {
    console.error("Error en setup:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. INICIO DEL SERVIDOR
const server = createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});

export default server;