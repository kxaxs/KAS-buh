import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Режим 'pages' — сборка под GitHub Pages (репозиторий отдаёт сайт из
// подпапки /KAS-buh/). Обычный билд остаётся с base '/' — так Capacitor
// WebView находит ассеты в APK, а Netlify/локальный превью — на корне.
const PAGES_BASE = '/KAS-buh/';

export default defineConfig(({ mode }) => {
  const base = mode === 'pages' ? PAGES_BASE : '/';

  return {
  base,
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
        start_url: base,
        scope: base,
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
        navigateFallback: `${base}index.html`,
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
    outDir: mode === 'pages' ? 'build-pages' : 'build',
    assetsDir: 'assets',
  },
  };
});
