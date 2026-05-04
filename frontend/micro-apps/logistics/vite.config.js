import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('logistics', {
      useDevMode: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8088,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    cors: true
  }
})
