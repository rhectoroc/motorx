# Plan de Diseño Web Premium: MotorX

**Proyecto:** MotorX - Rediseño Web Completo  
**Fecha de Creación:** 2026-01-29  
**Estado:** ⏳ Pendiente de Aprobación y Ejecución  
**Prioridad:** Media (después de implementar QuickBooks)

---

## 📋 RESUMEN EJECUTIVO

### Objetivo
Modernizar la presencia digital de MotorX reemplazando el sitio Wix actual con una plataforma premium, innovadora y altamente visual que eleve la percepción de marca.

### Concepto Visual
**"Precision in Motion"** - Un sitio web que refleja la precisión de la logística automotriz con la elegancia de una marca premium tecnológica.

### Identidad Visual Estricta
- 🔴 **Rojo:** #E31E24 (vibrante, logo, CTAs)
- ⚫ **Negro:** #0A0A0A (fondo dark mode)
- ⚪ **Blanco:** #FFFFFF (texto principal)

### Stack Tecnológico (Aprovechando lo Existente)
- **Framework:** React 18 ✅ (ya implementado)
- **Routing:** React Router ✅ (ya implementado)
- **Styling:** Tailwind CSS 3 ✅ (ya implementado)
- **Animaciones:** GSAP ✅ (ya implementado - mantener)
- **3D Background:** Three.js ✅ (ya implementado - reutilizar)
- **Iconos:** Lucide React ✅ (ya implementado)
- **Mapas:** Mapbox GL JS (nuevo)
- **Forms:** React Hook Form + Zod (nuevo)

---

## 🎨 PALETA DE COLORES COMPLETA

```css
/* Colores Primarios */
--motorx-red-primary: #E31E24;      /* Rojo vibrante (logo) */
--motorx-red-dark: #B71C1C;         /* Rojo oscuro (hover) */
--motorx-red-light: #FF5252;        /* Rojo claro (acentos) */

/* Colores Neutrales */
--motorx-black: #0A0A0A;            /* Negro profundo (fondo) */
--motorx-gray-900: #1A1A1A;         /* Gris muy oscuro (cards) */
--motorx-gray-800: #2A2A2A;         /* Gris oscuro (borders) */
--motorx-gray-700: #3A3A3A;         /* Gris medio oscuro */
--motorx-gray-300: #CCCCCC;         /* Gris claro (texto secundario) */
--motorx-white: #FFFFFF;            /* Blanco puro (texto principal) */

/* Gradientes */
--gradient-red: linear-gradient(135deg, #E31E24 0%, #B71C1C 100%);
--gradient-dark: linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%);
--gradient-glow: radial-gradient(circle at 50% 50%, rgba(227, 30, 36, 0.15) 0%, transparent 70%);
```

---

## 🗺️ ARQUITECTURA DE INFORMACIÓN

### Estructura del Sitio (6 Secciones Principales)

```
MotorX
│
├── 🏠 HOME
│   ├── Hero Section (Video/3D Animation)
│   ├── Services Overview (3 cards)
│   ├── Stats Counter (animated)
│   ├── How It Works (timeline)
│   ├── Testimonials (carousel)
│   └── CTA Final
│
├── 🚚 DISPATCH
│   ├── Hero - Dispatch Services
│   ├── Coverage Map (Interactive Mapbox)
│   ├── Pricing Calculator (API integrada)
│   ├── Fleet Showcase
│   ├── Real-time Tracking Demo
│   └── Contact Form
│
├── 🎯 SINGLE BID
│   ├── Hero - One-Time Service
│   ├── How It Works (4 pasos)
│   ├── Auction Partners (Copart, IAAI, Manheim)
│   ├── Vehicle Search (demo)
│   ├── Pricing Transparency
│   └── Get Started Form
│
├── 🔄 SUBSCRIPTION
│   ├── Hero - Recurring Service
│   ├── Plans Comparison (Basic, Pro, Enterprise)
│   ├── Benefits Breakdown
│   ├── ROI Calculator
│   ├── Client Success Stories
│   └── Sign Up Form
│
├── 📝 BLOG
│   ├── Featured Articles
│   ├── Categories (Logistics, Auctions, Industry)
│   ├── Search & Filters
│   └── Article Template
│
└── 📞 CONTACT
    ├── Contact Form
    ├── Office Locations (Map)
    ├── Live Chat Widget
    ├── FAQ Accordion
    └── Social Links
```

---

## 💻 CONFIGURACIÓN TÉCNICA

### Tailwind Config Personalizado

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        motorx: {
          red: {
            DEFAULT: '#E31E24',
            dark: '#B71C1C',
            light: '#FF5252',
          },
          black: '#0A0A0A',
          gray: {
            900: '#1A1A1A',
            800: '#2A2A2A',
            700: '#3A3A3A',
            300: '#CCCCCC',
          },
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #E31E24 0%, #B71C1C 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(227, 30, 36, 0.3), 0 0 40px rgba(227, 30, 36, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Efectos Visuales Clave

#### Glassmorphism
```css
.glass-card {
    background: rgba(26, 26, 26, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

#### Glow Effect
```css
.glow-red {
    box-shadow: 
        0 0 20px rgba(227, 30, 36, 0.3),
        0 0 40px rgba(227, 30, 36, 0.2),
        0 0 60px rgba(227, 30, 36, 0.1);
}
```

---

## 🎬 ANIMACIONES CON FRAMER MOTION

### Ejemplo: Hero Section

```jsx
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative h-screen bg-motorx-black overflow-hidden">
      {/* Video Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
        <source src="/videos/hero-logistics.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-glow" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-6xl md:text-8xl font-bold text-motorx-white mb-6"
          >
            Precision in{' '}
            <span className="text-motorx-red">Motion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl text-motorx-gray-300 mb-12"
          >
            From Auction to Delivery, We Move Your Business Forward
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-red text-white font-semibold rounded-lg shadow-glow-red"
            >
              Get Started
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-motorx-white text-white font-semibold rounded-lg backdrop-blur-glass"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-motorx-white rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-motorx-red rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
```

### Tipos de Animaciones a Implementar

1. **Scroll-Reveal:** Elementos aparecen al hacer scroll
2. **Hover Effects:** Botones con scale y glow
3. **Page Transitions:** Fade in/out entre páginas (300ms)
4. **Counter Animation:** Stats con CountUp.js
5. **Timeline Animation:** Línea de progreso animada
6. **Carousel:** Transiciones suaves entre slides

---

## 🎯 FASES DE IMPLEMENTACIÓN

### FASE 1: Diseño y Wireframes
- [ ] Wireframes de las 6 páginas principales
- [ ] Mockups de alta fidelidad en Figma
- [ ] Prototipo interactivo
- [ ] Aprobación del diseño visual

### FASE 2: Desarrollo Frontend
- [ ] Setup del proyecto (aprovechar estructura actual)
- [ ] Implementación de páginas (Home, Dispatch, Single Bid, Subscription, Blog, Contact)
- [ ] Reutilización de componentes existentes (ThreeBackground, Logo)
- [ ] Animaciones con GSAP (ya implementado)
- [ ] Responsive design

### FASE 3: Integración Backend
- [ ] Conexión con APIs de Compras y Dispatch
- [ ] Pricing calculator con datos reales
- [ ] Formularios funcionales
- [ ] Mapas interactivos (Mapbox)

### FASE 4: Testing y Launch
- [ ] Testing cross-browser y mobile
- [ ] Optimización de performance
- [ ] SEO básico
- [ ] Deploy a producción

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Diseño Visual
- [ ] Paleta Rojo/Negro/Blanco aplicada estrictamente
- [ ] Dark mode implementado por defecto
- [ ] Tipografía Inter consistente
- [ ] Efectos glassmorphism en cards
- [ ] Gradientes sutiles en fondos

### Animaciones
- [ ] Scroll-reveal en todas las secciones
- [ ] Transiciones suaves entre páginas (300ms)
- [ ] Micro-interacciones en botones
- [ ] Hero con video o animación 3D
- [ ] Scroll indicator animado

### Performance
- [ ] Lighthouse Performance Score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Cumulative Layout Shift <0.1

### Responsive Design
- [ ] Mobile (320px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] 4K (2560px+)

### Funcionalidad
- [ ] Formularios validados (React Hook Form + Zod)
- [ ] Pricing calculator funcional
- [ ] Mapa interactivo (Mapbox)
- [ ] Blog con búsqueda
- [ ] Live chat integrado

### SEO
- [ ] Meta tags en todas las páginas
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Schema markup (JSON-LD)

---

## 📞 PRÓXIMOS PASOS - DECISIONES TÉCNICAS

### Confirmaciones Necesarias:

1. **Concepto Visual:**
   - ¿Apruebas la paleta de colores Rojo/Negro/Blanco?
   - ¿Apruebas el estilo Dark Mode premium?
   - ¿Apruebas la tipografía Inter?

2. **Arquitectura de Información:**
   - ¿Las 6 secciones principales son correctas? (Home, Dispatch, Single Bid, Subscription, Blog, Contact)
   - ¿Falta alguna sección importante?
   - ¿El flujo de navegación tiene sentido?

3. **Stack Tecnológico:**
   - ✅ Mantener GSAP para animaciones (ya implementado)
   - ✅ Mantener Three.js para background 3D (ya implementado)
   - ✅ Mantener Tailwind CSS (ya implementado)
   - ¿Agregar Mapbox para mapas interactivos?
   - ¿Agregar React Hook Form para formularios?

4. **Estructura del Proyecto:**
   - **Opción A:** Crear sitio web separado (`motorx-web`)
   - **Opción B:** Integrar en proyecto actual (`Appmx2`)
   - **Opción C:** Solo rediseñar landing actual
   
   # Configurar Tailwind
   npx tailwindcss init -p
   ```

3. **Estructura de Carpetas:**
   ```
   motorx-web/
   ├── public/
   │   ├── videos/
   │   └── images/
   ├── src/
   │   ├── components/
   │   │   ├── Hero.jsx
   │   │   ├── Navbar.jsx
   │   │   ├── Footer.jsx
   │   │   └── ...
   │   ├── pages/
   │   │   ├── Home.jsx
   │   │   ├── Dispatch.jsx
   │   │   ├── SingleBid.jsx
   │   │   ├── Subscription.jsx
   │   │   ├── Blog.jsx
   │   │   └── Contact.jsx
   │   ├── styles/
   │   │   └── index.css
   │   ├── utils/
   │   └── App.jsx
   └── tailwind.config.js
   ```

4. **Fase 1: Wireframes**
   - Crear cuenta en Figma
   - Diseñar wireframes de las 6 páginas
   - Presentar para aprobación

---

## 📝 NOTAS IMPORTANTES

### Dependencias con Fase 2 (QuickBooks)

El sitio web puede desarrollarse **en paralelo** con la implementación de QuickBooks, pero la integración backend dependerá de:

- ✅ **Pricing Calculator:** Requiere API de tarifas (Fase 2 - Semana 7)
- ✅ **Formularios:** Pueden funcionar con mockups inicialmente
- ✅ **Dashboard de Tracking:** Requiere API de vehículos

**Recomendación:** Iniciar diseño web después de aprobar plan de QuickBooks, pero antes de implementarlo.

### Alternativas de Stack

Si se prefiere **Next.js** en lugar de Vite:
- ✅ Mejor SEO (SSR)
- ✅ Image optimization automático
- ✅ API routes integradas
- ⚠️ Más complejo
- ⚠️ Requiere Node.js en servidor

### Assets Necesarios

- [ ] Logo MotorX en alta resolución (SVG)
- [ ] Video de hero (o presupuesto para producción)
- [ ] Fotografías de flota de vehículos
- [ ] Testimonios de clientes (texto + foto)
- [ ] Logos de partners (Copart, IAAI, Manheim)

---

## 🔄 HISTORIAL DE CAMBIOS

### 2026-01-29 - Plan Inicial
- ✅ Concepto visual "Precision in Motion"
- ✅ Arquitectura de 6 secciones
- ✅ Stack: React + Vite + Tailwind + Framer Motion
- ✅ Cronograma de 6-8 semanas
- ✅ Presupuesto de $37,600

### Próximas Actualizaciones
- [ ] Aprobación del cliente
- [ ] Wireframes completados
- [ ] Mockups completados
- [ ] Prototipo funcional
- [ ] Launch

---

**Última Actualización:** 2026-01-29 01:30 AM  
**Estado:** ⏳ Guardado en memoria persistente - Listo para ejecutar cuando se apruebe  
**Documento Relacionado:** `web_design_plan.md` (artifacts)
