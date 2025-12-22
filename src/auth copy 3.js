/**
 * WARNING: This file connects this app to Anythings's internal auth system. 
 * Modificado para asegurar la persistencia de roles y compatibilidad con el Dashboard.
 */
import CreateAuth from "@auth/create"
import Credentials from "@auth/core/providers/credentials"
import pg from 'pg';
const { Pool } = pg;
import { hash, verify } from 'argon2'

function Adapter(client) {
  return {
    async createVerificationToken(verificationToken) {
      const { identifier, expires, token } = verificationToken;
      const sql = `
        INSERT INTO auth_verification_token ( identifier, expires, token )
        VALUES ($1, $2, $3)
        `;
      await client.query(sql, [identifier, expires, token]);
      return verificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const sql = `delete from auth_verification_token
      where identifier = $1 and token = $2
      RETURNING identifier, expires, token `;
      const result = await client.query(sql, [identifier, token]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async createUser(user) {
      const { id, name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO auth_users (id, name, email, "emailVerified", image, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, "emailVerified", image, role`;
      const result = await client.query(sql, [
        id || crypto.randomUUID(),
        name,
        email,
        emailVerified,
        image,
        user.role || 'admin' // Por defecto admin para nuevos usuarios del sistema
      ]);
      return result.rows[0];
    },

    async getUser(id) {
      const sql = 'select * from auth_users where id = $1';
      try {
        const result = await client.query(sql, [id]);
        return result.rowCount === 0 ? null : result.rows[0];
      } catch {
        return null;
      }
    },

    async getUserByEmail(email) {
      const sql = 'select * from auth_users where email = $1';
      const result = await client.query(sql, [email]);
      if (result.rowCount === 0) return null;
      
      const userData = result.rows[0];
      const accountsData = await client.query(
        'select * from auth_accounts where "userId" = $1',
        [userData.id]
      );
      return {
        ...userData,
        accounts: accountsData.rows,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const sql = `
          select u.* from auth_users u join auth_accounts a on u.id = a."userId"
          where a.provider = $1 and a."providerAccountId" = $2`;
      const result = await client.query(sql, [provider, providerAccountId]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async updateUser(user) {
      const { id, name, email, emailVerified, image, role } = user;
      const updateSql = `
        UPDATE auth_users set
        name = $2, email = $3, "emailVerified" = $4, image = $5, role = $6
        where id = $1
        RETURNING *`;
      const query = await client.query(updateSql, [id, name, email, emailVerified, image, role]);
      return query.rows[0];
    },

    async linkAccount(account) {
      const sql = `
      insert into auth_accounts
      ("userId", provider, type, "providerAccountId", access_token, password)
      values ($1, $2, $3, $4, $5, $6)
      returning *`;
      const params = [
        account.userId,
        account.provider,
        account.type,
        account.providerAccountId,
        account.access_token,
        account.extraData?.password,
      ];
      const result = await client.query(sql, params);
      return result.rows[0];
    },
    // ... otros métodos (sessions, unlink) pueden seguir la misma lógica pg
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = Adapter(pool);

export const { auth } = CreateAuth({
  trustHost: true,
  providers: [
    Credentials({
      id: 'credentials-signin',
      name: 'Credentials Sign in',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials;
        if (!email || !password) return null;

        const user = await adapter.getUserByEmail(email);
        if (!user) return null;

        const matchingAccount = user.accounts.find(a => a.provider === 'credentials');
        if (!matchingAccount?.password) return null;

        const isValid = await verify(matchingAccount.password, password);
        
        if (isValid) {
            // RETORNAR EL ROL AQUÍ ES VITAL
            return {
                id: user.id,
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
      // Pasamos el rol del usuario de la DB al token JWT
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasamos el rol del token a la sesión que lee el frontend
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
  session: { strategy: 'jwt' }
});