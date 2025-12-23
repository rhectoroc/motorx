// _create/index.ts - VERSIÓN COMPLETA CORREGIDA
import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import pg from 'pg';
const { Pool } = pg;
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

// ========== CONFIGURACIÓN DE LOGS ==========
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
  }
}

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);
  console[method] = (...args: unknown[]) => {
    const store = als.getStore();
    if (store?.requestId) {
      original(`[traceId:${store.requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

// ========== INICIALIZACIÓN ==========
console.log('🚀 MotorX Server Starting...');
console.log('DB:', !!process.env.DATABASE_URL);
console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 3000);

// Verificar si estamos en build o runtime
if (process.env.VITE_IS_BUILDING) {
  console.log('📦 En fase de build, omitiendo inicialización del servidor');
}

const app = new Hono();

// ========== MIDDLEWARES ==========
app.use(contextStorage());
app.use(requestId());
app.use(async (c, next) => {
  const id = c.get('requestId');
  return als.run({ requestId: String(id) }, next);
});
app.use(cors());

// ========== SERVIR ARCHIVOS ESTÁTICOS ==========
console.log('📁 Configurando archivos estáticos...');
app.use('/build/*', serveStatic({ 
  root: './',
  onNotFound: (path) => console.warn(`Archivo estático no encontrado: ${path}`)
}));
app.use('/assets/*', serveStatic({ 
  root: './build/client',
  onNotFound: (path) => console.warn(`Asset no encontrado: ${path}`)
}));

// ========== BASE DE DATOS ==========
console.log('🗄️ Configurando base de datos...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error de PostgreSQL:', err);
});

// ========== ENDPOINTS DE DEBUG ==========
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'motorx',
    timestamp: new Date().toISOString(),
    node: process.version
  });
});

app.get('/debug', (c) => {
  return c.json({
    env: process.env.NODE_ENV,
    port: process.env.PORT || 3000,
    db_configured: !!process.env.DATABASE_URL,
    auth_configured: !!process.env.AUTH_SECRET,
    build_exists: true,
    runtime: 'bun'
  });
});

// ========== AUTENTICACIÓN ==========
if (process.env.AUTH_SECRET) {
  console.log('🔐 Configurando autenticación...');
  
  app.use(
    '*',
    initAuthConfig((c) => ({
      secret: process.env.AUTH_SECRET,
      adapter: NeonAdapter(pool as any),
      trustHost: true,
      skipCSRFCheck: skipCSRFCheck,
      providers: [
        Credentials({
          id: 'credentials',
          name: 'Credentials',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            console.log(`🔐 Intento de login para: ${email}`);
            
            if (!email || !password) return null;
            const adapter = NeonAdapter(pool as any);
            const user = await adapter.getUserByEmail(email as string);
            if (!user) {
              console.log(`❌ Usuario no encontrado: ${email}`);
              return null;
            }
            const account = user.accounts.find((a: any) => a.provider === 'credentials');
            if (!account || !account.password) {
              console.log(`❌ No hay cuenta credentials para: ${email}`);
              return null;
            }
            const isValid = await verify(account.password, password as string);
            if (isValid) {
              console.log(`✅ Login exitoso: ${email}`);
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role || 'user'
              };
            } else {
              console.log(`❌ Password incorrecto: ${email}`);
              return null;
            }
          },
        }),
      ],
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id;
            token.email = user.email;
            token.role = user.role || 'user';
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.role = token.role as string;
          }
          return session;
        },
      },
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
      },
      session: { 
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 días
      },
    }))
  );
} else {
  console.warn('⚠️ AUTH_SECRET no configurado - Autenticación deshabilitada');
}

// ========== INTEGRACIONES ==========
app.all('/integrations/:path{.+}', async (c) => {
  console.log(`🔌 Proxy de integración: ${c.req.path}`);
  
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${
    Object.keys(queryParams).length > 0 
      ? `?${new URLSearchParams(queryParams).toString()}` 
      : ''
  }`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST ?? '',
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST ?? '',
      Host: process.env.NEXT_PUBLIC_CREATE_HOST ?? '',
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID ?? '',
    },
  });
});

// ========== AUTH HANDLER ==========
app.use('/api/auth/*', async (c, next) => {
  console.log(`🔐 Ruta de auth: ${c.req.path}`);
  
  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  await next();
});

// ========== API ROUTES ==========
app.route(API_BASENAME, api);

// ========== LOGIN DE EMERGENCIA ==========
app.post('/api/auth/emergency-login', async (c) => {
  console.log('🚨 LOGIN DE EMERGENCIA SOLICITADO');
  
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (email === 'rhectoroc@gmail.com' && password === 'motorx123') {
      console.log('✅ Login de emergencia exitoso');
      return c.json({
        success: true,
        user: {
          id: 'emergency-1',
          email: email,
          name: 'Usuario de Emergencia',
          role: 'admin'
        },
        redirectTo: '/dashboard'
      });
    }
    
    return c.json({ 
      success: false, 
      error: 'Credenciales inválidas' 
    }, 401);
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Error procesando login' 
    }, 500);
  }
});

// ========== RUTA RAIZ - SERVIR FRONTEND ==========
app.get('/', async (c) => {
  console.log('🌐 Solicitud a ruta raíz');
  
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const indexPath = path.resolve(process.cwd(), 'build/client/index.html');
    const html = await fs.readFile(indexPath, 'utf-8');
    
    console.log('✅ Sirviendo index.html del build');
    return c.html(html);
  } catch (error: any) {
    console.error('❌ Error cargando index.html:', error.message);
    
    // Fallback HTML
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MotorX</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; padding: 2rem;
              display: flex; justify-content: center; align-items: center;
              min-height: 100vh; background: #f5f5f5;
            }
            .container { 
              background: white; padding: 3rem; border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;
              max-width: 500px;
            }
            h1 { color: #333; margin-bottom: 1rem; }
            .status { color: #666; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 MotorX</h1>
            <p class="status">Cargando aplicación...</p>
            <p>Si esto persiste, verifica que el build se completó correctamente.</p>
            <script type="module" src="/build/client/index.js"></script>
          </div>
        </body>
      </html>
    `);
  }
});

// ========== CATCH-ALL PARA SPA ==========
app.get('*', async (c) => {
  const pathname = new URL(c.req.url).pathname;
  
  // Ignorar rutas específicas
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/build/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/integrations/') ||
    pathname.startsWith('/debug') ||
    pathname.startsWith('/health')
  ) {
    return c.next();
  }
  
  console.log(`🌐 Ruta SPA: ${pathname} -> sirviendo index.html`);
  
  // Servir el mismo index.html para SPA
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const indexPath = path.resolve(process.cwd(), 'build/client/index.html');
    const html = await fs.readFile(indexPath, 'utf-8');
    return c.html(html);
  } catch (error: any) {
    console.error('❌ Error sirviendo SPA:', error.message);
    return c.next(); // Dejar que otros handlers manejen
  }
});

// ========== ERROR HANDLER ==========
app.onError((err, c) => {
  console.error('❌ Error no manejado:', err);
  return c.html(getHTMLForErrorPage(serializeError(err)), 500);
});

// ========== EXPORTACIÓN CON createHonoServer ==========
// ¡IMPORTANTE! Esto es lo que falta en tu código actual
// react-router-hono-server espera esto
const port = Number(process.env.PORT) || 3000;
const hostname = '0.0.0.0';

console.log(`✅ Exportando servidor en puerto ${port}, host ${hostname}`);

// Solo crear servidor si no estamos en fase de build
if (!process.env.VITE_IS_BUILDING && !process.env.REACT_ROUTER_BUILD) {
  console.log(`🚀 Iniciando servidor...`);
  
  const server = await createHonoServer({
    app,
    port,
    hostname,
    defaultLogger: false,
  });
  
  console.log(`✅ Servidor iniciado en http://${hostname}:${port}`);
  
  export default server;
} else {
  console.log('📦 En fase de build, solo exportando app');
  export default app;
}