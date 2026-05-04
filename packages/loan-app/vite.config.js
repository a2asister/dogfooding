import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('loan-app', { useDevMode: true })
  ],
  server: {
    port: 3004,
    cors: true,
    origin: 'http://localhost:3004'
  },
  base: '/loan/'
})
