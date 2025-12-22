import CreateAuth from "@auth/create";
import Credentials from "@auth/core/providers/credentials";
import pg from 'pg';
import { verify } from 'argon2';

const { Pool } = pg;

// Configuración del Pool de conexiones centralizado
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Adaptador para manejar la persistencia en PostgreSQL con tipos UUID
 */
function Adapter(client) {
  return {
    async createUser(user) {
      const { name, email, image, role } = user;
      const sql = `
        INSERT INTO auth_users (name, email, image, role, is_main_client)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role`;
      const result = await client.query(sql, [
        name,
        email,
        image,
        role || 'admin',
        true
      ]);
      return result.rows[0];
    },

    async getUser(id) {
      const sql = 'SELECT * FROM auth_users WHERE id = $1';
      const result = await client.query(sql, [id]);
      return result.rowCount === 0 ? null : result.rows[0];
    },

    async getUserByEmail(email) {
      const sql = 'SELECT * FROM auth_users WHERE email = $1';
      const result = await client.query(sql, [email]);
      if (result.rowCount === 0) return null;
      
      const userData = result.rows[0];
      // Buscamos la cuenta vinculada para la validación de contraseña
      const accountsData = await client.query(
        'SELECT * FROM auth_accounts WHERE "userId" = $1',
        [userData.id]
      );
      return {
        ...userData,
        accounts: accountsData.rows,
      };
    }
  };
}

const adapter = Adapter(pool);

export const { auth } = CreateAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      id: 'credentials-signin',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials.email;
        const password = credentials.password;

        if (!email || !password) return null;

        const user = await adapter.getUserByEmail(email);
        if (!user) return null;

        // Buscamos la cuenta que tenga el proveedor de credenciales
        const matchingAccount = user.accounts.find(a => a.provider === 'credentials');
        if (!matchingAccount || !matchingAccount.password) return null;

        // Verificación de hash con argon2
        const isValid = await verify(matchingAccount.password, password);
        
        if (isValid) {
            return {
                id: user.id, // Se mantiene como UUID string
                name: user.name,
                email: user.email,
                role: user.role || 'admin'
            };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Inyectamos el rol en el token JWT durante el login
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponemos el rol en la sesión para que el frontend (Dashboard) lo detecte
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
});