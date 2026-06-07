import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#66A9A9', fit: 'contain' },
    },
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#66A9A9', fit: 'contain' },
    },
    transparent: {
      sizes: [192, 512],
      padding: 0.05,
      resizeOptions: { background: 'transparent', fit: 'contain' },
    },
  },
  images: ['public/icon.svg'],
})
