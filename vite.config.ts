import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'AboutIAM - Identity Security Workspace',
        short_name: 'AboutIAM',
        description: 'The Interactive Identity Workspace & Architect Workbench',
        theme_color: '#070a13',
        background_color: '#070a13',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Exclude sitemap, RSS, LLM text, and the SSG pre-rendered HTML files that aren't the root
        globIgnores: ['**/node_modules/**/*', 'sitemap.xml', 'rss.xml', 'llms.txt', 'llms-full.txt', 'llms-index.json', 'qa.txt', '**/webllm*'],
        maximumFileSizeToCacheInBytes: 10485760 // 10MB
      }
    })
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', 'zustand', 'minisearch'].some((pkg) => id.includes(`node_modules/${pkg}`))) {
            return 'vendor'
          }
        },
      },
    },
  },
})
