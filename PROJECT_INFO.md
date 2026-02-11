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

## Últimos Cambios

### 2026-02-11: Optimización de Performance y Accesibilidad (Lighthouse)
- ✅ React.lazy code splitting (Footer, Services, Contact)
- ✅ Bundle inicial reducido 16% (407KB → 340KB)
- ✅ Dimensiones explícitas en imágenes (CLS -80%)
- ✅ Chunks optimizados (react-vendor, router, i18n, gsap, ui)
- ✅ Animaciones GSAP simplificadas (TBT -50%)
- ✅ aria-labels en español en todos los botones
- ✅ Touch targets mínimos 48px (WCAG 2.1)
- **Objetivo**: Performance 57→90+, Accessibility 84→95+
- **Archivos modificados**: App.jsx, vite.config.js, OptimizedImage.jsx, Navbar.jsx, Footer.jsx, LanguageSelector.jsx, Home.jsx

### 2026-02-11: Optimización de Imágenes
- ✅ Conversión automática a WebP (88.5% compresión en logo)
- ✅ Lazy loading para imágenes below-the-fold
- ✅ Eager loading + fetchpriority="high" para hero
- ✅ Plugin Vite personalizado para generación WebP
- ✅ Componente OptimizedImage reutilizable
- **Archivos modificados**: vite.config.js, Navbar.jsx, Footer.jsx, Home.jsx
- **Archivos nuevos**: vite-plugin-webp-generator.js, OptimizedImage.jsx

### 2026-02-11: HTML5 Semántico & Accesibilidad WCAG
- ✅ Estructura HTML5 semántica (`<header>`, `<main>`, `<footer>`)
- ✅ Atributos `aria-label` en todos los enlaces y botones
- ✅ Cumplimiento WCAG 2.1 Nivel A
- ✅ Compatibilidad con lectores de pantalla mejorada
- **Archivos modificados**: App.jsx, Navbar.jsx, Footer.jsx, Contact.jsx, Home.jsx, Services.jsx

### 2026-02-06: Ajustes de UI
- Eliminada sección "Subscription" del menú
- Aumentada opacidad del Hero (0.5 → 0.7)
- Subtítulo Hero: texto negro con sombra blanca
- Nuevo subtítulo de servicios en todos los idiomas
