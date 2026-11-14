import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import seoPages from './vite-plugin-seo.ts';

export default defineConfig({
  // GitHub Pages: strona leży pod /fitos-react/, więc zasoby muszą mieć ten prefiks
  base: '/fitos-react/',
  plugins: [
    react(),
    // PWA: instalacja na telefonie i praca offline. Service worker zapisuje w pamięci podręcznej
    // CAŁĄ aplikację (także leniwie ładowany eksport .docx), więc po pierwszym otwarciu działa bez zasięgu.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['fitos-icon.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      manifest: {
        id: '/fitos-react/',
        name: 'FITOS - karty obserwacji siedlisk',
        short_name: 'FITOS',
        description: 'Karty obserwacji siedlisk przyrodniczych w terenie, także bez zasięgu.',
        lang: 'pl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#2e6b3f',
        background_color: '#111315',
        categories: ['productivity', 'utilities', 'natura-2000'],
        icons: [
          // Android (WebAPK) bierze wyłącznie PNG – SVG w manifeście potrafi skończyć się domyślnym droidem
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // bundle z biblioteką docx jest spory – domyślne 2 MB by go pominęło
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\/karty\//],
        cleanupOutdatedCaches: true,
      },
    }),
    seoPages(),
  ],
  test: { environment: 'happy-dom', setupFiles: ['./src/test/setup.ts'] },
})
