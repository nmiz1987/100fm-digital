import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
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
