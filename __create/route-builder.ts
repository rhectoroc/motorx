// _create/route-builder.ts - VERSIÓN CORREGIDA
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';

const API_BASENAME = '/api';
const api = new Hono();

// DETERMINAR RUTA CORRECTA EN PRODUCCIÓN
function getApiDir(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // En producción, buscar en estas ubicaciones posibles
    const possiblePaths = [
      resolve(process.cwd(), 'build/server/src/app/api'),  // React Router build
      resolve(process.cwd(), 'src/app/api'),               // Código fuente (si existe)
      resolve(process.cwd(), 'app/api'),                   // Alternativa
    ];
    
    console.log('🔍 Buscando directorio API en producción...');
    for (const path of possiblePaths) {
      console.log(`   Probando: ${path}`);
      if (existsSync(path)) {
        console.log(`✅ Encontrado: ${path}`);
        return path;
      }
    }
    
    console.warn('⚠️ No se encontró directorio API en producción');
    // Crear directorio vacío para evitar errores
    const fallbackPath = resolve(process.cwd(), 'build/server/src/app/api');
    console.log(`   Usando fallback: ${fallbackPath}`);
    return fallbackPath;
  } else {
    // En desarrollo: ruta normal desde _create/
    return resolve(process.cwd(), 'src/app/api');
  }
}

const API_DIR = getApiDir();
console.log(`📁 Directorio API configurado: ${API_DIR}`);

// Verificar si existe
if (!existsSync(API_DIR)) {
  console.warn(`⚠️ El directorio API no existe: ${API_DIR}`);
  console.warn('   Creando directorio vacío para evitar errores...');
  // No crear automáticamente - mejor dejar que falle silenciosamente
}

async function findRouteFiles(dir: string): Promise<string[]> {
  // Si el directorio no existe, retornar vacío
  if (!existsSync(dir)) {
    console.warn(`📭 Directorio no existe: ${dir}`);
    return [];
  }
  
  try {
    const files = await readdir(dir);
    let routes: string[] = [];

    for (const file of files) {
      try {
        const filePath = join(dir, file);
        const statResult = await stat(filePath);

        if (statResult.isDirectory()) {
          // Buscar recursivamente en subdirectorios
          const subRoutes = await findRouteFiles(filePath);
          routes.push(...subRoutes);
        } else if (file === 'route.js' || file === 'route.ts') {
          // Aceptar tanto .js como .ts
          routes.push(filePath);
          console.log(`   📄 Encontrada ruta: ${filePath.replace(dir + '/', '')}`);
        }
      } catch (error) {
        console.error(`❌ Error leyendo ${file}:`, error);
      }
    }

    return routes;
  } catch (error: any) {
    // Error silencioso - no romper la app si no hay API
    if (error.code === 'ENOENT') {
      console.warn(`📭 Directorio no encontrado: ${dir}`);
    } else {
      console.error(`❌ Error buscando rutas en ${dir}:`, error);
    }
    return [];
  }
}

function getHonoPath(filePath: string, baseDir: string): string {
  // Normalizar rutas para Windows/Linux
  const normalizedBase = baseDir.replace(/\\/g, '/');
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Obtener ruta relativa
  let relativePath = normalizedPath.replace(normalizedBase, '');
  
  // Remover /route.js o /route.ts
  relativePath = relativePath.replace(/\/route\.(js|ts)$/, '');
  
  // Si es ruta raíz del API
  if (relativePath === '') {
    return '/';
  }
  
  // Convertir parámetros de React Router a Hono
  // [id] → :id
  // [...slug] → :slug*
  let honoPath = relativePath
    .replace(/\[\.\.\.([^\]]+)\]/g, ':$1*')
    .replace(/\[([^\]]+)\]/g, ':$1');
  
  // Asegurar que empiece con /
  if (!honoPath.startsWith('/')) {
    honoPath = '/' + honoPath;
  }
  
  return honoPath;
}

// ✅ FUNCIÓN PARA REGISTRAR RUTAS
export async function registerRoutes() {
  console.log(`🔍 Registrando rutas API desde: ${API_DIR}`);
  
  const routeFiles = await findRouteFiles(API_DIR);
  
  if (routeFiles.length === 0) {
    console.log('ℹ️ No se encontraron archivos route.js/ts');
    // Agregar ruta de prueba para verificar que el API funciona
    api.get('/test', (c) => c.json({ 
      message: 'API is working', 
      timestamp: new Date().toISOString(),
      routes_count: 0 
    }));
    return;
  }
  
  console.log(`📊 Total de rutas encontradas: ${routeFiles.length}`);
  
  for (const routeFile of routeFiles) {
    try {
      // Importar la ruta
      const route = await import(/* @vite-ignore */ `file://${routeFile}`);
      
      // Obtener path para Hono
      const honoPath = getHonoPath(routeFile, API_DIR);
      
      // Registrar métodos HTTP
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
      let registeredMethods: string[] = [];
      
      for (const method of methods) {
        if (route[method]) {
          const handler: Handler = async (c) => {
            try {
              const params = c.req.param();
              console.log(`🔄 ${method} ${honoPath}`, { params });
              
              // Manejar tanto rutas segmentadas como normales
              if (route.segmentedRoute && route.segmentedRoute[method]) {
                const result = await route.segmentedRoute[method](c.req.raw, { params });
                return result;
              }
              
              const result = await route[method](c.req.raw, { params });
              return result;
            } catch (error: any) {
              console.error(`❌ Error en ${method} ${honoPath}:`, error);
              return c.json({ 
                error: 'Internal server error',
                message: error.message,
                path: honoPath 
              }, 500);
            }
          };
          
          const methodLower = method.toLowerCase() as keyof Hono;
          if (methodLower in api) {
            (api as any)[methodLower](honoPath, handler);
            registeredMethods.push(method);
          }
        }
      }
      
      if (registeredMethods.length > 0) {
        console.log(`   ✅ ${honoPath} [${registeredMethods.join(', ')}]`);
      }
      
    } catch (error: any) {
      console.error(`❌ Error importando ${routeFile}:`, error.message);
    }
  }
  
  console.log(`✅ Registro de rutas API completado`);
  
  // Agregar ruta de salud del API
  api.get('/health', (c) => c.json({ 
    status: 'healthy', 
    service: 'motorx-api',
    timestamp: new Date().toISOString(),
    routes_registered: routeFiles.length
  }));
}

// ✅ Exportar API y base path
export { API_BASENAME, api };