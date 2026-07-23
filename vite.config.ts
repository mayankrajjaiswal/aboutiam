import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
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
