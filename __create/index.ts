import { Hono } from 'hono';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import CredentialsProvider from '@auth/core/providers/credentials';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { cors } from 'hono/cors';
// Importamos el tipo, no el código, para evitar el error de resolución
import type { RequestHandler } from "@react-router/node";
import { api, API_BASENAME, registerRoutes } from './route-builder';

const app = new Hono();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: 'mx',
  ssl: false,
});

app.use('*', cors());

// Inicialización de rutas de API
await registerRoutes();
app.route(API_BASENAME, api);

// Configuración de Auth.js
app.use(
  '/api/auth/*',
  initAuthConfig((c) => ({
    secret: process.env.AUTH_SECRET,
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        authorize: async (credentials) => {
          // ... (tu lógica de authorize se mantiene igual)
          const query = `SELECT u.id, u.name, u.email, u.role, a.password as hashed_password 
                         FROM auth_users u JOIN auth_accounts a ON u.id = a."userId" 
                         WHERE u.email = $1`;
          const result = await pool.query(query, [credentials.email]);
          const user = result.rows[0];
          if (user && await (argon2 as any).verify(user.hashed_password, credentials.password)) {
            return { id: user.id, name: user.name, email: user.email, role: user.role };
          }
          return null;
        }
      })
    ],
    basePath: '/api/auth',
    trustHost: true,
  }))
);

app.all('/api/auth/*', authHandler());

// --- SOLUCIÓN AL ERROR DE BUILD ---
let handler: RequestHandler;

app.all("*", async (c) => {
  // Solo intentamos importar el build si estamos en producción y no lo hemos hecho aún
  if (process.env.NODE_ENV === "production") {
    if (!handler) {
      // @ts-ignore - Esta ruta solo existirá DESPUÉS del build
      const build = await import("../build/server/index.js");
      const { createRequestHandler } = await import("@react-router/node");
      handler = createRequestHandler(build, "production");
    }
    return handler(c.req.raw);
  }
  
  // En desarrollo, esto no debería ejecutarse porque Vite maneja el dev server
  return c.text("Modo Desarrollo - El servidor de React Router no está listo.");
});

export default app;