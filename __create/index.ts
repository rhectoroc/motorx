import { Hono } from 'hono';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import CredentialsProvider from '@auth/core/providers/credentials';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { cors } from 'hono/cors';
// @ts-ignore - Importado desde el build de React Router
import { createRequestHandler } from "@react-router/node";

const app = new Hono();

// 1. Conexión a la DB 'mx'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: 'mx',
  ssl: false,
});

app.use('*', cors());

// 2. Configuración de Auth.js
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
            // Consulta exacta según tu esquema
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

// 3. RUTAS DE API MANUALES (Si tienes alguna)
app.get('/api/health', (c) => c.json({ status: 'ok', db: 'mx' }));

// 4. EL PASO CLAVE: Delegar el resto a React Router
// Esto permite que se vea la interfaz original en lugar de solo texto
app.all("*", async (c) => {
  try {
    // @ts-ignore - Esto carga el servidor de React Router generado en el build
    const build = await import("../build/server/index.js");
    const handler = createRequestHandler(build, "production");
    return handler(c.req.raw);
  } catch (error) {
    console.error("Error delegando a React Router:", error);
    return c.text("Error cargando la interfaz. Verifica que 'bun run build' se ejecutó.", 500);
  }
});

export default app;