import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // PWA: instalacja na telefonie i praca offline. Service worker zapisuje w pamięci podręcznej
    // CAŁĄ aplikację (także leniwie ładowany eksport .docx), więc po pierwszym otwarciu działa bez zasięgu.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['fitos-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'FITOS – karty obserwacji siedlisk',
        short_name: 'FITOS',
        description: 'Karty obserwacji siedlisk przyrodniczych w terenie, także bez zasięgu.',
        lang: 'pl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#2e6b3f',
        background_color: '#111315',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // bundle z biblioteką docx jest spory – domyślne 2 MB by go pominęło
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: { environment: 'happy-dom', setupFiles: ['./src/test/setup.ts'] },
})
