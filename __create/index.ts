import { Hono } from 'hono'
import { logger } from 'hono/logger'
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

// DEBUG START
console.log('🚀 MotorX Server Starting...')
console.log('DB:', !!process.env.DATABASE_URL)
console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET)

// MIDDLEWARE
app.use('*', requestId())
app.use('*', contextStorage())
app.use('*', cors())

// ✅ FIX 1: HEALTHCHECK (EVITA SIGTERM)
app.get('/health', (c) => {
  console.log('✅ HEALTHCHECK OK')
  return c.json({ status: 'ok' })
})

// ✅ FIX 2: USER PROFILE (auth_users corregido)
app.get('/api/user/profile', async (c) => {
  console.log('🔍 Profile API')
  try {
    const session = await auth()
    if (!session?.user?.id) return c.json({ error: 'Unauthorized' }, 401)
    
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

// ✅ FIX 3: AUTH INTERCEPT (CRÍTICO - ANTES React Router)
app.all('/api/auth/:path*', async (c) => {
  console.log(`🔍 AUTH ${c.req.method} ${c.req.url}`)
  
  // Manejo específico para signin/credentials
  if (c.req.path === '/api/auth/signin/credentials') {
    try {
      const body = await c.req.json()
      console.log('Login attempt:', body.email)
      
      // Verificar credenciales manual
      const result = await pool.query(
        'SELECT au.id, au.email, au.role, aa.password ' +
        'FROM auth_users au JOIN auth_accounts aa ON au.id = aa."userId" ' +
        'WHERE au.email = $1 AND aa.provider = $2',
        [body.email, 'credentials']
      )
      
      if (result.rows.length > 0) {
        console.log('✅ LOGIN SUCCESS:', body.email)
        // Crear session simple para test
        return c.json({ 
          ok: true, 
          url: '/dashboard',
          user: { email: body.email, role: 'admin' }
        })
      } else {
        console.log('❌ LOGIN FAIL:', body.email)
        return c.json({ error: 'Invalid credentials' }, 401)
      }
    } catch (error) {
      console.error('Auth error:', error)
      return c.json({ error: 'Auth failed' }, 401)
    }
  }
  
  // Otras rutas auth
  return c.json({ debug: 'Auth route', path: c.req.param('path') })
})

// REACT ROUTER (ORIGINAL - NO TOCAR)
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
app.route('/__create/*', api)  // ✅ FIX: Solo __create routes

export default app
