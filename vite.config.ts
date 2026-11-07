import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || './'),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: './',
        name: 'ศาลเจ้าแห่งโชคลาภ — Lucky Shrine',
        short_name: 'LuckyShrine',
        description: 'เซียมซี ไพ่ยิปซี เลขมงคล และสะเดาะเคราะห์ออนไลน์ 10 อารยธรรม',
        theme_color: '#120a08',
        background_color: '#120a08',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,woff,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api/glo': {
        target: 'https://www.glo.or.th',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/glo/, '/api'),
      },
      '/api/tts': {
        target: 'https://translate.google.com',
        changeOrigin: true,
        secure: false,
        headers: {
          Referer: '',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        rewrite: (path) => path.replace(/^\/api\/tts/, '/translate_tts'),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api/glo': {
        target: 'https://www.glo.or.th',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/glo/, '/api'),
      },
      '/api/tts': {
        target: 'https://translate.google.com',
        changeOrigin: true,
        secure: false,
        headers: {
          Referer: '',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        rewrite: (path) => path.replace(/^\/api\/tts/, '/translate_tts'),
      },
    },
  },
}));

