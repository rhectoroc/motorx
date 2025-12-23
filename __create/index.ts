import { Hono } from 'hono'

const app = new Hono()

console.log('🚀 MotorX ULTRA MINIMO')

// ✅ AUTH QUE BLOQUEA TODO
app.post('/api/auth/signin/credentials', async (c) => {
  console.log('✅ LOGIN DIRECT HIT!')
  const body = await c.req.json()
  
  if (body.email === 'rhectoroc@gmail.com' && body.password === 'motorx123') {
    return c.json({
      ok: true,
      url: '/dashboard',
      user: { id: 1, email: body.email, name: 'Rhector', role: 'admin' }
    })
  }
  return c.json({ error: 'Invalid credentials' }, 401)
})

// Profile
app.get('/api/user/profile', (c) => 
  c.json({ user: { id: 1, email: 'rhectoroc@gmail.com', role: 'admin' } })
)

// Health
app.get('/health', (c) => c.json({ status: 'ok' }))

// TODO LO DEMÁS → SPA
app.get('*', (c) => c.html(`
<!DOCTYPE html>
<html>
<head><title>MotorX</title></head>
<body>
  <div id="root"></div>
  <script type="module" src="/build/client/index.js"></script>
</body>
</html>
`))

export default app
