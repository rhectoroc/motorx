import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { createHonoServer } from '@react-router/node/server'  // ✅ CORREGIDO
import { API_BASENAME } from '@react-router/node'             // ✅ CORREGIDO
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono<{
  Variables: {
    auth: any
  }
}>()

// 🔍 DEBUG
console.log('🚀 Starting MotorX...')
console.log('DB:', !!process.env.DATABASE_URL)
console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET)

// 1. MIDDLEWARE
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// 2. HEALTHCHECK (EVITA SIGTERM)
app.get('/health', (c) => {
  console.log('✅ HEALTH OK')
  return c.json({ status: 'ok', uptime: process.uptime() })
})

// 3. /api/user/profile (ANTES React Router)
app.get('/api/user/profile', async (c) => {
  console.log('🔍 Profile API')
  try {
    // @ts-ignore
    const session = await c.get('auth')?.()
    if (!session?.user?.id) return c.json({ error: 'Unauthorized' }, 401)

    const result = await pool.query(
      'SELECT id, name, email, role, image FROM auth_users WHERE id = $1',
      [session.user.id]
    )
    
    return c.json({ user: { ...result.rows[0], role: result.rows[0]?.role || 'client' } })
  } catch (e) {
    console.error('Profile error:', e)
    return c.json({ error: 'Server error' }, 500)
  }
})

// 4. AUTH DEBUG (CRÍTICO - ANTES React Router)
app.all('/api/auth/:path*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.url}`)
  try {
    // Tu auth handler existente aquí
    // await authHandler(c)
    return c.json({ debug: 'Auth route hit', path: c.req.param('path') })
  } catch (e) {
    console.error('AUTH ERROR:', e)
    return c.json({ error: e.message }, 500)
  }
})

// 5. REACT ROUTER (ÚLTIMO)
const { registerRoutes, api } = await createHonoServer(app, {
  getLoadContext: () => ({ pool })
})

await registerRoutes()
app.route(API_BASENAME, api)

export default app
