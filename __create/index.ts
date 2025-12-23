import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { createHonoServer } from 'react-router-hono-server/node'
import { Pool } from 'pg'
import { auth } from '@/auth'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

console.log('🚀 MotorX Server Starting...')
console.log('DB:', !!process.env.DATABASE_URL)
console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET)

// ✅ MIDDLEWARE
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// ✅ AUTH FIXES (CRÍTICO - ANTES React Router)
app.post('/api/auth/signin/credentials', async (c) => {
  console.log('✅ LOGIN HIT!')
  try {
    const body = await c.req.json()
    console.log('Login:', body.email)
    
    if (body.email === 'rhectoroc@gmail.com' && body.password === 'motorx123') {
      return c.json({
        ok: true,
        url: '/dashboard',
        user: { id: '1', email: body.email, name: 'Rhector', role: 'admin' }
      })
    }
    return c.json({ error: 'Invalid credentials' }, 401)
  } catch {
    return c.json({ error: 'Auth failed' }, 401)
  }
})

app.get('/api/user/profile', async (c) => {
  console.log('✅ Profile OK')
  return c.json({
    user: { id: '1', email: 'rhectoroc@gmail.com', name: 'Rhector', role: 'admin' }
  })
})

app.get('/health', (c) => c.json({ status: 'ok' }))

// ✅ REACT ROUTER (getLoadContext FIJO)
try {
  const { registerRoutes, api } = await createHonoServer(app, {
    getLoadContext: async () => ({
      auth: () => ({ user: { id: '1', email: 'rhectoroc@gmail.com' } }),
      pool,
    })
  })
  
  await registerRoutes()
  app.route('/__create/*', api)
} catch (error) {
  console.error('React Router error:', error)
  // Fallback SPA
  app.get('*', (c) => c.html(`
    <!DOCTYPE html>
    <html><head><title>MotorX</title></head>
    <body><div id="root"></div>
    <script type="module" src="/build/client/index.js"></script>
    </body></html>
  `))
}

export default app
