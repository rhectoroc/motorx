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

// 1. Conexión a la base de datos 'mx'
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

// 2. Configuración de Auth.js compatible con tus callbacks
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
          const user = await adapter.getUserByEmail(credentials.email);
          if (!user) return null;
          const accounts = await adapter.getAccountsByUserId(user.id);
          const matchingAccount = accounts.find(a => a.provider === 'credentials');
          if (!matchingAccount?.password) return null;
          const isValid = await verify(matchingAccount.password, credentials.password);
          if (isValid) return { id: user.id, name: user.name, email: user.email, role: user.role };
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

// 3. Rutas de la API
await registerRoutes();
app.route(API_BASENAME, api);

// 4. Ruta corregida para tu formulario de /admin-setup
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    const hashedPassword = await hash(password);
    
    // Insertamos directamente para que Postgres asigne el ID entero (SERIAL)
    // Esto evita el error de "invalid input syntax for type integer" visto en la imagen
    const userRes = await pool.query(
      `INSERT INTO auth_users (name, email, role, "emailVerified") 
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [name, email, 'admin']
    );
    const newUser = userRes.rows[0];

    // Vinculamos la cuenta usando el ID numérico retornado
    await adapter.linkAccount({
      userId: newUser.id,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: newUser.id.toString(),
      password: hashedPassword, 
    });

    return c.json({ success: true, message: "Admin configurado exitosamente" });
  } catch (err: any) {
    console.error("Error en setup:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. Servidor de producción
const server = createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});

export default server;