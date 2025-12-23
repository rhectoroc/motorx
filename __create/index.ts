import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { Pool } from 'pg'
import { createRouteManifest } from '@react-router/node'
import { serveStatic } from '@react-router/node/server'
import { authHandler } from '@hono/auth-js/handler'
import { auth } from '@/auth'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

// DEBUG
console.log('🚀 MotorX Starting...')
console.log('DB OK:', !!process.env.DATABASE_URL)
console.log('AUTH OK:', !!process.env.AUTH_SECRET)

// 1. MIDDLEWARE
app.use('*', cors())
app.use('*', requestId())

// 2. HEALTHCHECK (ANTI-SIGTERM)
app.get('/health', (c) => {
  console.log('✅ HEALTHCHECK PASS')
  return c.json({ status: 'ok' })
})

// 3. API USER PROFILE
app.get('/api/user/profile', async (c) => {
  console.log('🔍 Profile API hit')
  try {
    const session = await auth()
    if (!session?.user?.id) return c.json({ error: 'Unauthorized' }, 401)
    
    const result = await pool.query(
      'SELECT id, name, email, role FROM auth_users WHERE id = $1',
      [session.user.id]
    )
    return c.json({ user: result.rows[0] || { role: 'client' } })
  } catch (e) {
    console.error('Profile error:', e)
    return c.json({ error: 'Server error' }, 500)
  }
})

// 4. AUTH ENDPOINTS (CRÍTICO - Intercepta ANTES React Router)
app.all('/api/auth/:path*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.url}`)
  try {
    const result = await authHandler(c)
    console.log(`✅ AUTH SUCCESS ${c.req.url}`)
    return result
  } catch (error) {
    console.error(`❌ AUTH ERROR ${c.req.url}:`, error.message)
    return c.json({ error: error.message }, 401)
  }
})

// 5. REACT ROUTER (ÚLTIMO - File-based routes)
serveStatic(app, {
  path: './build/client',
  prefix: '/assets'
})

app.all('*', async (c) => {
  const manifest = await createRouteManifest('./build/server/routes/**/*.{js,ts}')
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head><title>MotorX</title></head>
    <body>
      <div id="root"></div>
      <script type="module" src="/assets/entry.client.js"></script>
    </body>
    </html>
  `)
})

export default {
  port: 80,
  fetch: app.fetch
}
