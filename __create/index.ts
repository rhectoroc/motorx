import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { createHonoServer } from 'react-router-hono-server/node'
import { API_BASENAME } from '@react-router/node'
import { Pool } from 'pg'
import { authHandler } from '@hono/auth-js/handler'
import { auth } from '@/auth'
import { initAuthConfig } from '@/auth'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

// 🔍 DEBUG STARTUP
console.log('🚀 MotorX Server Starting...')
console.log('✅ DB:', !!process.env.DATABASE_URL)
console.log('✅ AUTH_SECRET:', !!process.env.AUTH_SECRET)

// 1️⃣ MIDDLEWARE (mantener original)
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// 2️⃣ HEALTHCHECK (ANTI-SIGTERM)
app.get('/health', (c) => {
  console.log('✅ HEALTHCHECK PASS')
  return c.json({ status: 'ok', uptime: process.uptime() })
})

// 3️⃣ API USER PROFILE (CRÍTICO para dashboard)
app.get('/api/user/profile', async (c) => {
  console.log('🔍 /api/user/profile')
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role, image FROM auth_users WHERE id = $1',
      [session.user.id]
    )
    
    return c.json({
      user: {
        ...result.rows[0],
        role: result.rows[0]?.role || 'client'
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// 4️⃣ AUTH ROUTES (CRÍTICO - ANTES React Router)
initAuthConfig({
  trustHost: true,
  basePath: '/api/auth'
})

app.all('/api/auth/:path*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.url}`)
  try {
    const result = await authHandler(c)
    console.log(`✅ AUTH ${c.req.method} ${c.req.url} OK`)
    return result
  } catch (error) {
    console.error(`❌ AUTH ERROR ${c.req.url}:`, error.message)
    return c.json({ error: error.message }, 401)
  }
})

// 5️⃣ REACT ROUTER (ÚLTIMO - TU CÓDIGO ORIGINAL)
const { registerRoutes, api } = await createHonoServer(app, {
  getLoadContext: async (args) => {
    return {
      auth,
      pool,
      ...args
    }
  }
})

await registerRoutes()
app.route(API_BASENAME, api)

export default app
