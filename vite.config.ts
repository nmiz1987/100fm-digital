import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: '100FM Digital',
        short_name: '100FM',
        description: 'תחנת הרדיו 100FM - שידור חי',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#66A9A9',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache app shell (JS, CSS, HTML) with stale-while-revalidate
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Live stream URLs — always go network, never cache
            urlPattern: /\.(m3u8|ts)(\?.*)?$/,
            handler: 'NetworkOnly',
          },
          {
            // Station metadata / API responses — network first, 1h cache fallback
            urlPattern: /^https:\/\/.*\.(json)(\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
})
