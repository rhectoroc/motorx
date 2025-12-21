/**
 * WARNING: This file connects this app to Anythings's internal auth system. 
 * Modificado para usar pg estándar y asegurar compatibilidad con el Dashboard.
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
      // Se añade el campo ID para asegurar que no sea nulo al insertar
      const sql = `
        INSERT INTO auth_users (id, name, email, "emailVerified", image)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, "emailVerified", image`;
      const result = await client.query(sql, [
        id || crypto.randomUUID(), // Genera ID si no viene en el objeto user
        name,
        email,
        emailVerified,
        image,
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
      if (result.rowCount === 0) {
        return null;
      }
      const userData = result.rows[0];
      const accountsData = await client.query(
        'select * from auth_accounts where "userId" = $1', // Corregido para usar userId
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
          where
          a.provider = $1
          and
          a."providerAccountId" = $2`;

      const result = await client.query(sql, [provider, providerAccountId]);
      return result.rowCount !== 0 ? result.rows[0] : null;
    },

    async updateUser(user) {
      const { id, name, email, emailVerified, image } = user;
      const updateSql = `
        UPDATE auth_users set
        name = $2, email = $3, "emailVerified" = $4, image = $5
        where id = $1
        RETURNING name, id, email, "emailVerified", image
      `;
      const query = await client.query(updateSql, [
        id,
        name,
        email,
        emailVerified,
        image,
      ]);
      return query.rows[0];
    },

    async linkAccount(account) {
      const sql = `
      insert into auth_accounts
      (
        "userId", provider, type, "providerAccountId", access_token,
        expires_at, refresh_token, id_token, scope, session_state,
        token_type, password
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning *`;

      const params = [
        account.userId,
        account.provider,
        account.type,
        account.providerAccountId,
        account.access_token,
        account.expires_at,
        account.refresh_token,
        account.id_token,
        account.scope,
        account.session_state,
        account.token_type,
        account.extraData?.password,
      ];

      const result = await client.query(sql, params);
      return result.rows[0];
    },

    async createSession({ sessionToken, userId, expires }) {
      const sql = `insert into auth_sessions ("userId", expires, "sessionToken")
      values ($1, $2, $3)
      RETURNING id, "sessionToken", "userId", expires`;
      const result = await client.query(sql, [userId, expires, sessionToken]);
      return result.rows[0];
    },

    async getSessionAndUser(sessionToken) {
      const result1 = await client.query(
        `select * from auth_sessions where "sessionToken" = $1`,
        [sessionToken]
      );
      if (result1.rowCount === 0) return null;
      const session = result1.rows[0];

      const result2 = await client.query(
        'select * from auth_users where id = $1',
        [session.userId]
      );
      if (result2.rowCount === 0) return null;
      const user = result2.rows[0];
      return { session, user };
    },

    async deleteSession(sessionToken) {
      const sql = `delete from auth_sessions where "sessionToken" = $1`;
      await client.query(sql, [sessionToken]);
    },

    async unlinkAccount(partialAccount) {
      const { provider, providerAccountId } = partialAccount;
      const sql = `delete from auth_accounts where "providerAccountId" = $1 and provider = $2`;
      await client.query(sql, [providerAccountId, provider]);
    },
    
    // ... implementar otros métodos si es necesario
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = Adapter(pool);

export const { auth } = CreateAuth({
  trustHost: true, // Vital para evitar errores de sesión en Easypanel
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
        return isValid ? user : null;
      },
    }),
  ],
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
  },
  session: { strategy: 'jwt' }
});