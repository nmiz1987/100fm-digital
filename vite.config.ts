import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
  plugins: [
    react({ babel: { plugins: [['babel-plugin-react-compiler', {}]] } }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/app-proxy': {
        target: 'https://digital.100fm.co.il',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-proxy/, ''),
      },
      '/nowplaying-proxy': {
        target: 'https://digital.100fm.co.il',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nowplaying-proxy/, ''),
      },
    },
  },
})
