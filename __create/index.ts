// index.ts - Configuración de Auth.js corregida
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

// 1. Configuración de Base de Datos - IMPORTANTE: agregar database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Asegurar que use la BD correcta
  ...(process.env.DATABASE_URL?.includes('postgresql://') ? {} : {
    database: 'mx'
  })
});

const adapter = MyAdapter(pool);
const app = new Hono();

// Middlewares base
app.use('*', requestId());
app.use('*', contextStorage());
app.use('*', cors());

// ✅ AUTH MOCK EMERGENCIA (AGREGAR ANTES de authHandler)
app.post('/api/auth/signin/credentials', async (c) => {
  console.log('✅ LOGIN EMERGENCIA!');
  const body = await c.req.json();
  if (body.email === 'rhectoroc@gmail.com' && body.password === 'motorx123') {
    return c.json({
      ok: true,
      url: '/dashboard',
      user: { id: '1', email: body.email, name: 'Rhector', role: 'admin' }
    });
  }
  return c.json({ error: 'Invalid credentials' }, 401);
});

// 2. CONFIGURACIÓN DE AUTH.JS CORREGIDA
app.use('/api/auth/*', initAuthConfig((c) => ({
  trustHost: true,
  adapter,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) return null;

        try {
          // Buscar usuario por email
          const result = await pool.query(
            'SELECT * FROM auth_users WHERE email = $1',
            [email]
          );
          
          if (result.rows.length === 0) return null;
          const user = result.rows[0];

          // Buscar cuenta de credentials
          const accountResult = await pool.query(
            'SELECT * FROM auth_accounts WHERE "userId" = $1 AND provider = $2',
            [user.id, 'credentials']
          );

          if (accountResult.rows.length === 0) return null;
          const account = accountResult.rows[0];

          // Verificar password
          const isValid = await verify(account.password || '', password);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'admin'
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
  },
  session: { strategy: 'jwt' },
  skipCSRFCheck,
})));

app.all('/api/auth/:action', async (c) => {
  return await authHandler()(c);
});

app.all('/api/auth/:action/:provider', async (c) => {
  return await authHandler()(c);
});

// 3. Registrar rutas API
try {
  await registerRoutes();
  app.route(API_BASENAME, api);
  console.log('✅ Rutas API registradas correctamente');
} catch (error) {
  console.error('❌ Error registrando rutas:', error);
}

// 4. SETUP DE ADMIN
app.post('/api/admin-setup', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Verificar si ya existe
    const userResult = await pool.query(
      'SELECT * FROM auth_users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length > 0) {
      return c.json({ error: 'Usuario ya existe' }, 400);
    }

    // Crear usuario
    const hashedPassword = await hash(password);
    const newUser = await pool.query(
      `INSERT INTO auth_users (name, email, "emailVerified", role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Admin', email, new Date(), 'admin']
    );

    // Crear cuenta
    await pool.query(
      `INSERT INTO auth_accounts 
       ("userId", provider, type, "providerAccountId", password)
       VALUES ($1, $2, $3, $4, $5)`,
      [newUser.rows[0].id, 'credentials', 'credentials', email, hashedPassword]
    );

    return c.json({ success: true });
  } catch (error) {
    console.error('Error en admin-setup:', error);
    return c.json({ error: 'Error interno' }, 500);
  }
});

// 5. SPA CATCH-ALL
app.get('*', (c) => c.html(`
<!DOCTYPE html>
<html><head><title>MotorX</title></head>
<body><div id="root"></div>
<script type="module" src="/build/client/index.js"></script>
</body></html>
`));

// 6. Exportar con puerto dinámico
const port = parseInt(process.env.PORT || '80');
console.log(`🚀 Servidor iniciando en puerto ${port}...`);

export default {
  port,
  hostname: '0.0.0.0',
  fetch: app.fetch
};