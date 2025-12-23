import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { Pool } from 'pg'

// Tu auth existente (sin nuevos imports)
import { auth } from '@/auth'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

console.log('🚀 MotorX Starting...')

// 1. MIDDLEWARE
app.use('*', cors())
app.use('*', requestId())

// 2. HEALTHCHECK (EVITA SIGTERM)
app.get('/health', (c) => {
  console.log('✅ HEALTH OK')
  return c.json({ status: 'ok' })
})

// 3. USER PROFILE (SIMPLE)
app.get('/api/user/profile', async (c) => {
  console.log('🔍 Profile hit')
  try {
    // @ts-ignore
    const session = await auth()
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401)
    
    const result = await pool.query(
      'SELECT id, name, email, role FROM auth_users WHERE id = $1',
      [session.user.id]
    )
    return c.json({ user: result.rows[0] || { role: 'client' } })
  } catch (e) {
    console.error('Profile error:', e)
    return c.json({ error: 'Error' }, 500)
  }
})

// 4. AUTH DEBUG (SIMPLE - sin @hono/auth-js imports)
app.all('/api/auth/:path*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.url}`)
  // Tu auth handler original aquí o simple response
  return c.json({ debug: 'Auth route', path: c.req.param('path') })
})

// 5. React Router ORIGINAL (sin tocar)
const { registerRoutes, api } = await createHonoServer(app)
await registerRoutes()
app.route('/api/*', api) // Ajuste mínimo

export default app
async function createHonoServer(app: Hono) {
  // Importa tu route-builder original aquí
  const { registerRoutes } = await import('../__create/route-builder.js')
  const api = app.clone()
  return { registerRoutes, api }
}