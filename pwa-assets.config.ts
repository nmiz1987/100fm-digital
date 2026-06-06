import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#66A9A9' },
    },
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#66A9A9' },
    },
    transparent: {
      sizes: [192, 512],
      padding: 0.05,
      resizeOptions: { background: 'transparent' },
    },
  },
  images: ['public/icon.svg'],
})
