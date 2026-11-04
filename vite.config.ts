import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Регистрация service worker вручную из src/index.tsx и только в
      // браузере: внутри APK ассеты отдаёт WebView Capacitor, и SW там
      // мешал бы обновлениям приложения.
      injectRegister: false,
      manifest: {
        name: 'KAS Бухгалтерия',
        short_name: 'KAS Бух',
        description: 'Учёт чеков, услуг и доходов — работает офлайн',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0F1115',
        background_color: '#0F1115',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        // Обработчик клика по уведомлению: закрывает уведомление и
        // фокусирует/открывает окно приложения (см. public/sw-notif.js).
        importScripts: ['sw-notif.js'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    base: '/kas-buh/',
    outDir: 'build',
    assetsDir: 'assets',
  },
});
