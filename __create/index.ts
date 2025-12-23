import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const app = new Hono()

console.log('🚀 MotorX v2 Starting...')

// CORS + Health
app.use('*', cors())
app.get('/health', (c) => c.json({ status: 'ok' }))

// ✅ AUTH COMPLETO (BLOQUEA React Router)
app.post('/api/auth/signin/credentials', async (c) => {
  console.log('✅ LOGIN HIT!')
  const body = await c.req.json()
  console.log('Email:', body.email)
  
  if (body.email === 'rhectoroc@gmail.com' && body.password === 'motorx123') {
    return c.json({
      ok: true,
      url: '/dashboard',
      user: { 
        id: 1, 
        email: body.email, 
        name: 'Rhector Ocando', 
        role: 'admin',
        image: null
      }
    })
  }
  return c.json({ error: 'Invalid credentials' }, 401)
})

// Profile
app.get('/api/user/profile', async (c) => {
  console.log('✅ Profile OK')
  return c.json({ 
    user: { 
      id: 1, 
      email: 'rhectoroc@gmail.com', 
      name: 'Rhector Ocando', 
      role: 'admin' 
    } 
  })
})

// SPA SIMPLE (sin React Router)
app.get('*', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MotorX Dashboard</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script type="module" crossorigin src="/build/client/index.js"></script>
    </head>
    <body>
      <div id="root"></div>
      <script>window.initialUser = {email: 'rhectoroc@gmail.com', role: 'admin'}</script>
    </body>
    </html>
  `)
})

export default {
  port: 80,
  fetch: app.fetch
}
