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
          vendor: ['react', 'react-dom', 'react-router-dom'],
          gsap: ['gsap'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
