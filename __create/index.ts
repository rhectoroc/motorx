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

// 1. Configuración de Base de Datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = MyAdapter(pool);
const app = new Hono();

// Middlewares base
app.use('*', requestId());
app.use('*', contextStorage());
app.use('*', cors());

// 2. CONFIGURACIÓN DE AUTH.JS (Como Middleware)
// Se añade trustHost y basePath para resolver problemas de redirección en producción
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET || "secreto_temporal_de_emergencia_1234567890",
  adapter: adapter,
  trustHost: true, // Crucial para Easypanel/Proxies
  basePath: '/api/auth',
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const user = await adapter.getUserByEmail(credentials.email as string);
          if (!user) return null;

          const matchingAccount = user.accounts?.find(a => a.provider === 'credentials');
          // Validamos que exista la contraseña en la cuenta vinculada
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
      if (session?.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si la URL es el login o raíz, forzamos ir al dashboard tras éxito
      if (url.includes('/signin') || url === baseUrl) return `${baseUrl}/dashboard`;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/account/signin',
  },
  skipCSRFCheck: skipCSRFCheck
})));

// 3. MANEJADORES DE RUTAS AUTH
// Capturan las acciones de Auth.js (session, callback, signin, etc.)
app.all('/api/auth/:action', async (c) => authHandler()(c));
app.all('/api/auth/:action/:provider', async (c) => authHandler()(c));

// 4. RUTAS DE LA API DINÁMICAS
// Se deben registrar antes de montar la ruta base de la API
await registerRoutes();
app.route(API_BASENAME, api);

// 5. SETUP DE ADMIN (Lógica de Actualización/Upsert)
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    const hashedPassword = await hash(password);
    
    // Evitamos "duplicate key" verificando existencia previa
    let user = await adapter.getUserByEmail(email);
    let userId: string;

    if (user) {
      userId = user.id;
      console.log(`Usuario ${email} encontrado, actualizando...`);
    } else {
      userId = crypto.randomUUID();
      user = await adapter.createUser({
        id: userId,
        name,
        email,
        emailVerified: new Date(),
        role: 'admin'
      });
      console.log(`Nuevo usuario ${email} creado.`);
    }

    // Vinculamos o sobreescribimos la cuenta con la nueva contraseña
    await adapter.linkAccount({
      userId: userId,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: userId,
      password: hashedPassword, 
    });

    return c.json({ 
      success: true, 
      message: user ? "Credenciales actualizadas correctamente" : "Admin creado" 
    });
  } catch (err: any) {
    console.error("Error en admin-setup:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 6. MANEJO DE CIERRE (Graceful Shutdown para evitar SIGTERM brusco)
const server = createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});

process.on('SIGTERM', async () => {
  console.log('Cerrando pool de base de datos...');
  await pool.end();
  process.exit(0);
});

export default server;