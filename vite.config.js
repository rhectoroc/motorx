import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webpGenerator from './vite-plugin-webp-generator.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webpGenerator({
      quality: 80, // 80% quality for good balance between size and quality
      formats: ['.jpg', '.jpeg', '.png']
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React core from other vendors for better caching
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'gsap': ['gsap'],
          'ui': ['lucide-react'],
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
