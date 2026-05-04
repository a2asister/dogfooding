import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [vue(), qiankun('risk-app', { useDevMode: true })],
  server: { port: 3006, cors: true, origin: 'http://localhost:3006' },
  base: '/risk/'
})
