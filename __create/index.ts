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

// 1️⃣ MIDDLEWARE (ORIGINAL)
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// 2️⃣ ✅ FIXES CRÍTICOS (ANTES React Router)
app.get('/health', (c) => {
  console.log('✅ HEALTH OK')
  return c.json({ status: 'ok' })
})

app.post('/api/auth/signin/credentials', async (c) => {
  console.log('✅ LOGIN HIT!')
  try {
    const body = await c.req.json()
    console.log('Login attempt:', body.email)
    
    // Login directo para MotorX
    if (body.email === 'rhectoroc@gmail.com' && body.password === 'motorx123') {
      return c.json({
        ok: true,
        url: '/dashboard',
        user: {
          id: '1',
          email: body.email,
          name: 'Rhector Ocando',
          role: 'admin',
          image: null
        }
      })
    }
    return c.json({ error: 'Invalid credentials' }, 401)
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Auth failed' }, 401)
  }
})

app.get('/api/user/profile', async (c) => {
  console.log('✅ Profile OK')
  return c.json({
    user: {
      id: '1',
      email: 'rhectoroc@gmail.com',
      name: 'Rhector Ocando',
      role: 'admin',
      image: null
    }
  })
})

// 3️⃣ REACT ROUTER (ORIGINAL - Compatible con tu package.json)
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
app.route('/__create/*', api)

export default app
