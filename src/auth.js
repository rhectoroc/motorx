import CreateAuth from "@auth/create"
import Credentials from "@auth/core/providers/credentials"
import pg from 'pg';
const { Pool } = pg;
import { verify } from 'argon2'

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function Adapter(client) {
  return {
    async createUser(user) {
      const { name, email, image, role } = user;
      // Dejamos que el ID SERIAL se genere solo
      const sql = `
        INSERT INTO auth_users (name, email, image, role, is_main_client)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role`;
      const result = await client.query(sql, [name, email, image, role || 'admin', true]);
      return result.rows[0];
    },
    async getUser(id) {
      const result = await client.query('SELECT * FROM auth_users WHERE id = $1', [id]);
      return result.rowCount === 0 ? null : result.rows[0];
    },
    async getUserByEmail(email) {
      const result = await client.query('SELECT * FROM auth_users WHERE email = $1', [email]);
      if (result.rowCount === 0) return null;
      const user = result.rows[0];
      const accounts = await client.query('SELECT * FROM auth_accounts WHERE "userId" = $1', [user.id]);
      return { ...user, accounts: accounts.rows };
    },
    async linkAccount(account) {
      const sql = `INSERT INTO auth_accounts ("userId", provider, type, "providerAccountId", password) VALUES ($1, $2, $3, $4, $5)`;
      await client.query(sql, [account.userId, account.provider, account.type, account.providerAccountId, account.extraData?.password]);
    }
  };
}

export const { auth } = CreateAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      id: 'credentials-signin',
      authorize: async (credentials) => {
        const user = await Adapter(pool).getUserByEmail(credentials.email);
        if (user && await verify(user.accounts[0]?.password, credentials.password)) {
          return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    }
  }
});