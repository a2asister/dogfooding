import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [vue(), qiankun('report-app', { useDevMode: true })],
  server: { port: 3007, cors: true, origin: 'http://localhost:3007' },
  base: '/report/'
})
