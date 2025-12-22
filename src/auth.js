/**
 * WARNING: This file connects this app to Anythings's internal auth system. 
 * Modificado para asegurar la persistencia de roles y compatibilidad con el Dashboard.
 * ✅ CORREGIDO: Todas las tablas usan nombres PLURALES correctos (auth_users, auth_accounts, etc.)
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
        INSERT INTO auth_verification_token (identifier, expires, token)
        VALUES ($1, $2, $3)
      `;
      await client.query(sql, [identifier, expires, token]);
      return verificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const sql = `
        DELETE FROM auth_verification_token
        WHERE identifier = $1 AND token = $2
        RETURNING identifier, expires, token
      `;
      const result = await client.query(sql, [identifier, token]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async createUser(user) {
      const { id, name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO auth_users (id, name, email, "emailVerified", image, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, "emailVerified", image, role
      `;
      const result = await client.query(sql, [
        id || crypto.randomUUID(),
        name,
        email,
        emailVerified,
        image,
        user.role || 'admin' // ✅ Por defecto admin para nuevos usuarios
      ]);
      return result.rows[0];
    },

    async getUser(id) {
      const sql = 'SELECT * FROM auth_users WHERE id = $1';
      try {
        const result = await client.query(sql, [id]);
        return result.rowCount === 0 ? null : result.rows[0];
      } catch {
        return null;
      }
    },

    async getUserByEmail(email) {
      const sql = 'SELECT * FROM auth_users WHERE email = $1';
      const result = await client.query(sql, [email]);
      if (result.rowCount === 0) return null;
      
      const userData = result.rows[0];
      const accountsData = await client.query(
        'SELECT * FROM auth_accounts WHERE "userId" = $1',
        [userData.id]
      );
      return {
        ...userData,
        accounts: accountsData.rows,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const sql = `
        SELECT u.* FROM auth_users u 
        JOIN auth_accounts a ON u.id = a."userId"
        WHERE a.provider = $1 AND a."providerAccountId" = $2
      `;
      const result = await client.query(sql, [provider, providerAccountId]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async updateUser(user) {
      const { id, name, email, emailVerified, image, role } = user;
      const updateSql = `
        UPDATE auth_users SET
        name = $2, email = $3, "emailVerified" = $4, image = $5, role = $6
        WHERE id = $1
        RETURNING *
      `;
      const query = await client.query(updateSql, [id, name, email, emailVerified, image, role]);
      return query.rows[0];
    },

    async linkAccount(account) {
      const sql = `
        INSERT INTO auth_accounts
        ("userId", provider, type, "providerAccountId", access_token, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
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

    // ✅ MÉTODOS ADICIONALES para sesiones completas
    async createSession(session) {
      const sql = `
        INSERT INTO auth_sessions (id, session_token, user_id, expires)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(sql, [
        session.id,
        session.sessionToken,
        session.userId,
        session.expires
      ]);
      return session;
    },

    async getSessionAndUser(sessionToken) {
      const sql = `
        SELECT s.*, u.* FROM auth_sessions s
        JOIN auth_users u ON s.user_id = u.id
        WHERE s.session_token = $1
      `;
      const result = await client.query(sql, [sessionToken]);
      return result.rowCount === 0 ? null : result.rows[0];
    },

    async updateSession(session) {
      const sql = `
        UPDATE auth_sessions
        SET expires = $2
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(sql, [session.id, session.expires]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async deleteSession(sessionToken) {
      const sql = 'DELETE FROM auth_sessions WHERE session_token = $1';
      await client.query(sql, [sessionToken]);
    }
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = Adapter(pool);

export const { auth } = CreateAuth({
  trustHost: true,
  adapter, // ✅ Adapter corregido con tablas PLURALES
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
          // ✅ RETORNA ROL DESDE DB - VITAL para Dashboard
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
      // ✅ Pasa rol de DB → JWT
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // ✅ Pasa rol de JWT → Frontend (useSession/useAuth)
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
