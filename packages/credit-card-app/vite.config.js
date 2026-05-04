import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('credit-card-app', { useDevMode: true })
  ],
  server: {
    port: 3005,
    cors: true,
    origin: 'http://localhost:3005'
  },
  base: '/credit-card/'
})
