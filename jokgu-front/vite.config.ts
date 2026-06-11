import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '모임 일정관리 앱',
        short_name: "zoc9",
        description: "족구 모임 일정관리",
        theme_color: '#3182F6',
        icons: [
          {
            src: '/icon_small.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon_large.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
      globPatterns: ['**/*.{js,css,html,png}']
      }
    })
  ],
  optimizeDeps: {
    include: ['recharts']
  }
})
