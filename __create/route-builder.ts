import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Determinamos si estamos en producción para ajustar la ruta de búsqueda
const isProd = process.env.NODE_ENV === 'production';

const __dirname = isProd 
  ? resolve(process.cwd(), 'src/app/api')  // ← Cambiado de 'build/server/src/app/api' a 'src/app/api'
  : join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');
// Reemplazamos la función global fetch con nuestra versión actualizada

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

async function findRouteFiles(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    let routes: string[] = [];

    for (const file of files) {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        routes.push(filePath);
      }
    }
    return routes;
  } catch (error) {
    console.error(`Error buscando rutas en ${dir}:`, error);
    return [];
  }
}

function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace(__dirname, '');
  const parts = relativePath.split(/[\\/]/).filter(Boolean);
  const routeParts = parts.slice(0, -1);
  
  if (routeParts.length === 0) return [{ name: 'root', pattern: '' }];
  
  return routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
}

// Exportamos la función para llamarla desde index.ts de forma controlada
export async function registerRoutes() {
  const routeFiles = await findRouteFiles(__dirname);

  for (const routeFile of routeFiles) {
    try {
      const route = await import(/* @vite-ignore */ `file://${routeFile}?update=${Date.now()}`);

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
      for (const method of methods) {
        if (route[method]) {
          const parts = getHonoPath(routeFile);
          const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
          
          const handler: Handler = async (c) => {
            const params = c.req.param();
            return await route[method](c.req.raw, { params });
          };

          const methodLowercase = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
          
          // Corrección para advertencia de VSCode: Indexado dinámico seguro
          if (methodLowercase in api) {
            (api as any)[methodLowercase](honoPath, handler);
          }
        }
      }
    } catch (error) {
      console.error(`Error cargando archivo de ruta ${routeFile}:`, error);
    }
  }
}

export { api, API_BASENAME };