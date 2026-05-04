import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('wealth-app', { useDevMode: true })
  ],
  server: {
    port: 3003,
    cors: true,
    origin: 'http://localhost:3003'
  },
  base: '/wealth/'
})
