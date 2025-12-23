import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { Pool } from 'pg'
import { auth } from '@/auth'

// SIN createHonoServer problemático
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

console.log('🚀 MotorX Server Starting...')
console.log('DB:', !!process.env.DATABASE_URL)
console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET)

// 1️⃣ MIDDLEWARE
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// 2️⃣ HEALTHCHECK (CRÍTICO)
app.get('/health', (c) => {
  console.log('✅ HEALTH OK')
  return c.json({ status: 'ok' })
})

// 3️⃣ AUTH INTERCEPT (CRÍTICO - ANTES TODO)
app.all('/api/auth/*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.path}`)
  
  if (c.req.path.includes('signin/credentials')) {
    try {
      const body = await c.req.json()
      console.log('Login:', body.email)
      
      // Login simple para test
      if (body.email === 'rhectoroc@gmail.com' && body.password === 'motorx123') {
        return c.json({
          ok: true,
          url: '/dashboard',
          user: { id: 1, email: body.email, name: 'Rhector', role: 'admin' }
        })
      }
      return c.json({ error: 'Invalid credentials' }, 401)
    } catch (e) {
      return c.json({ error: 'Auth error' }, 401)
    }
  }
  
  return c.json({ auth: 'ok' })
})

// 4️⃣ USER PROFILE
app.get('/api/user/profile', async (c) => {
  console.log('🔍 Profile')
  try {
    const session = await auth()
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401)
    
    const result = await pool.query(
      'SELECT id, name, email, role FROM auth_users WHERE id = $1',
      [session.user.id]
    )
    
    return c.json({ user: result.rows[0] || { role: 'client' } })
  } catch (e) {
    return c.json({ error: 'Error' }, 500)
  }
})

// 5️⃣ CATCH-ALL SPA (SIMPLE)
app.get('*', async (c) => {
  console.log(`SPA: ${c.req.path}`)
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MotorX</title>
        <script type="module" src="/build/client/index.js"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `)
})

export default app

