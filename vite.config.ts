/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],

  server: {
    proxy: {
      '/api': {
        target: 'https://navjyotiuat.punjabandsind.bank.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(/^\/api/, '/BCG-PSB-MOBILE/api'),
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})