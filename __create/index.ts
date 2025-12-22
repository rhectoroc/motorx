import { Hono } from 'hono';
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js';
import CredentialsProvider from '@auth/core/providers/credentials';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static'; // Importante para servir el frontend
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const app = new Hono();

// 1. CORS y Seguridad
app.use('*', cors());

// 2. Conexión a la Base de Datos 'mx'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: 'mx',
  ssl: false,
});

// 3. Configuración de Auth.js
app.use(
  '/api/auth/*',
  initAuthConfig((c) => ({
    secret: process.env.AUTH_SECRET,
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          try {
            const query = `
              SELECT u.id, u.name, u.email, u.role, a.password as hashed_password 
              FROM auth_users u
              JOIN auth_accounts a ON u.id = a."userId"
              WHERE u.email = $1 AND a.provider = 'credentials'
            `;
            const result = await pool.query(query, [credentials.email]);
            const user = result.rows[0];
            if (user && user.hashed_password) {
              const isValid = await (argon2 as any).compare(user.hashed_password, credentials.password as string);
              if (isValid) return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
            }
            return null;
          } catch (error) {
            return null;
          }
        }
      })
    ],
    basePath: '/api/auth',
    trustHost: true,
  }))
);

app.all('/api/auth/*', authHandler());

// --- SECCIÓN CRÍTICA PARA LA INTERFAZ ---

// 4. Servir archivos estáticos (CSS, JS, Imágenes)
// Asumimos que Easypanel construye tu frontend en la carpeta 'dist'
app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/favicon.ico', serveStatic({ path: './dist/favicon.ico' }));

// 5. Servir el index.html para la ruta raíz y cualquier ruta del frontend
// Esto permite que al recargar la página en /dashboard no dé error 404
app.get('*', async (c) => {
  const path = c.req.path;
  
  // Si la ruta es para la API, no servir el HTML
  if (path.startsWith('/api')) {
    return c.notFound();
  }

  try {
    // Intentamos leer el archivo index.html de tu compilación
    const html = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
    return c.html(html);
  } catch (e) {
    // Si falla (por ejemplo en desarrollo), mostramos un mensaje de auxilio
    return c.html('<h1>Iniciando MotorX...</h1><p>Si ves esto, el frontend se está compilando o la ruta "dist" es incorrecta.</p>');
  }
});

export default app;