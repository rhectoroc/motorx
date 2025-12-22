import { Hono } from 'hono';
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js';
import CredentialsProvider from '@auth/core/providers/credentials';
import { Pool } from 'pg';
import * as argon2 from 'argon2'; 
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

// Conexión forzada a la base de datos 'mx'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: 'mx', 
  ssl: false,
});

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
            // Consulta exacta según tu esquema de bdd.sql
            const query = `
              SELECT u.id, u.name, u.email, u.role, a.password as hashed_password 
              FROM auth_users u
              JOIN auth_accounts a ON u.id = a."userId"
              WHERE u.email = $1 AND a.provider = 'credentials'
            `;
            
            const result = await pool.query(query, [credentials.email]);
            const user = result.rows[0];

            if (user && user.hashed_password) {
              // Si TS sigue molestando, forzamos el acceso a la propiedad como 'any'
              const isValid = await (argon2 as any).compare(
                user.hashed_password, 
                credentials.password as string
              );
              
              if (isValid) {
                return {
                  id: user.id.toString(),
                  name: user.name,
                  email: user.email,
                  role: user.role,
                };
              }
            }
            return null;
          } catch (error) {
            console.error("Error en auth:", error);
            return null;
          }
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) (token as any).role = (user as any).role;
        return token;
      },
      async session({ session, token }) {
        if (session.user) (session.user as any).role = token.role;
        return session;
      }
    },
    basePath: '/api/auth',
    trustHost: true,
  }))
);

app.all('/api/auth/*', authHandler());

app.get('/', (c) => c.text('MotorX API activa y conectada a DB: mx 🚀'));

export default app;