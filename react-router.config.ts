import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
  // Eliminamos el prerenderizado de rutas dinámicas durante el build
  // para evitar que el compilador intente acceder a carpetas inexistentes
  prerender: false,
} satisfies Config;
