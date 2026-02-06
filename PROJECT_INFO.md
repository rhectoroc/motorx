# MotorX Web - Referencia Rápida

> Para documentación completa, ver: `../structure.md`

## Proyecto: motorx-web

**Tipo**: Sitio web público/marketing  
**Puerto**: 80 (Nginx)  
**Stack**: React 19 + Vite 7 + Tailwind CSS 4

## Comandos

```bash
npm run dev      # Desarrollo local (http://localhost:5173)
npm run build    # Build de producción
npm run preview  # Preview del build
```

## Estructura

```
src/
├── components/     # Navbar, Footer, SEO, LanguageSelector
├── pages/         # Home, Services, Contact, etc.
├── i18n/          # Traducciones (en, es, ar, ru)
├── data/          # services.js
└── assets/        # Imágenes, videos, logos
```

## Características

- ✅ Multiidioma (4 idiomas)
- ✅ SEO optimizado
- ✅ Animaciones GSAP
- ✅ Responsive design
- ✅ Dark theme

## Deployment

1. Commit/Push a Git
2. Deploy manual en EasyPanel
3. Docker build automático
4. Nginx sirve archivos estáticos

## Paleta de Colores

- `motorx-black`: #171717
- `motorx-red`: #DC2626
- `motorx-red-dark`: #991B1B
- `motorx-white`: #FFFFFF

## Últimos Cambios (2026-02-06)

- Eliminada sección "Subscription" del menú
- Aumentada opacidad del Hero (0.5 → 0.7)
- Subtítulo Hero: texto negro con sombra blanca
- Nuevo subtítulo de servicios en todos los idiomas
