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
// El uso de basePath es vital para evitar el error "UnknownAction"
app.use('/api/auth/*', initAuthConfig((c) => ({
  secret: process.env.AUTH_SECRET || "secreto_temporal_de_emergencia_1234567890",
  adapter: adapter,
  trustHost: true,
  basePath: '/api/auth', // Indica a Auth.js que ignore este prefijo al buscar acciones
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const user = await adapter.getUserByEmail(credentials.email as string);
          if (!user) return null;

          const matchingAccount = user.accounts?.find(a => a.provider === 'credentials');
          // Buscamos la contraseña directamente en la cuenta
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
  },
  pages: {
    signIn: '/account/signin',
  },
  skipCSRFCheck: skipCSRFCheck
})));

// 3. MANEJADORES DE RUTAS AUTH
// Usamos rutas con parámetros para que Auth.js reciba la "acción" (session, callback, etc.) correctamente
app.all('/api/auth/:action', async (c) => authHandler()(c));
app.all('/api/auth/:action/:provider', async (c) => authHandler()(c));

// 4. RUTAS DE LA API DINÁMICAS
// Importante: registrar las rutas antes de montar la API
await registerRoutes();
app.route(API_BASENAME, api);

// 5. SETUP DE ADMIN MEJORADO (Evita error de duplicidad de Email)
app.post('/api/admin-setup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    const hashedPassword = await hash(password);
    
    // Verificar si el usuario ya existe para evitar "duplicate key"
    let user = await adapter.getUserByEmail(email);
    let userId: string;

    if (user) {
      userId = user.id;
      // Si el usuario existe, nos aseguramos de que el rol sea admin
      // Nota: Dependiendo de tu adaptador, podrías necesitar una función updateUser.
      console.log(`Usuario ${email} encontrado, actualizando cuenta.`);
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

    // Vincular o actualizar la contraseña en la cuenta de credenciales
    await adapter.linkAccount({
      userId: userId,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: userId,
      password: hashedPassword, // Se guarda aquí para que authorize() lo encuentre
    });

    return c.json({ 
      success: true, 
      message: user ? "Credenciales de administrador actualizadas" : "Administrador creado con éxito" 
    });
  } catch (err: any) {
    console.error("Error en setup:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default createHonoServer({
  app,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});