import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { createHonoServer } from 'react-router-hono-server'
import { API_BASENAME } from '@react-router/node'
import { auth } from '@/auth'
import type { AuthConfig } from '@hono/auth-js'
import { authHandler } from '@hono/auth-js/handler'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

// 🔍 DEBUG LOGS
console.log('🚀 Starting MotorX server...')
console.log('DB:', process.env.DATABASE_URL ? 'OK' : 'MISSING')
console.log('AUTH_SECRET:', process.env.AUTH_SECRET ? 'OK' : 'MISSING')

// 1. MIDDLEWARE (PRIMERO)
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// ✅ 2. HEALTHCHECK (CRÍTICO para EasyPanel)
app.get('/health', (c) => {
  console.log('✅ HEALTHCHECK OK')
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// ✅ 3. API USER PROFILE (ANTES de React Router)
app.get('/api/user/profile', async (c) => {
  console.log('🔍 /api/user/profile called')
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return c.json({ error: 'No autorizado' }, 401)
    }

    const result = await pool.query(
      'SELECT id, name, email, role, image FROM auth_users WHERE id = $1',
      [session.user.id]
    )

    if (result.rowCount === 0) {
      return c.json({ error: 'Usuario no encontrado' }, 404)
    }

    return c.json({
      user: {
        ...result.rows[0],
        role: result.rows[0].role || session.user.role || 'client'
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    return c.json({ error: 'Error interno' }, 500)
  }
})

// ✅ 4. AUTH HANDLER (CRÍTICO - ANTES de React Router)
const authConfig: AuthConfig = {
  // Tu configuración auth existente...
  // basePath: '/api/auth',
  // trustHost: true,
  // ...
}

initAuthConfig(authConfig)

app.all('/api/auth/:path*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.url}`)
  try {
    const result = await authHandler(c)
    console.log(`✅ AUTH ${c.req.method} ${c.req.url} 200`)
    return result
  } catch (error) {
    console.error(`❌ AUTH ERROR ${c.req.url}:`, error.message)
    return c.json({ error: error.message }, 500)
  }
})

// 5. REACT ROUTER (ÚLTIMO)
await registerRoutes()
app.route(API_BASENAME, api)

export default createHonoServer(app, {
  getLoadContext: async (args) => {
    return {
      auth,
      pool,
      ...args
    }
  }
})