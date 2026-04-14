import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'FusiFlow — Gestão de Projetos AMB FUSI AÍ',
        short_name: 'FusiFlow',
        description: 'Gestão de Projetos AMB FUSI AÍ',
        theme_color: '#011938',
        background_color: '#011938',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['business', 'productivity'],
        lang: 'pt-BR',
        dir: 'ltr',
        orientation: 'any',
        shortcuts: [
          {
            name: 'Novo Projeto',
            short_name: 'Novo',
            description: 'Criar um novo projeto',
            url: '/?action=new-project',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Projetos',
            short_name: 'Projetos',
            description: 'Ver todos os projetos',
            url: '/projects',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Firebase Auth & Firestore
            urlPattern: /^https:\/\/(identitytoolkit|securetoken|firestore)\.googleapis\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Firebase Storage
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    hmr: {
      overlay: true,
    },
  },
});
