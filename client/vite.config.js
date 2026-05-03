import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 9876, // 不常用端口号
    proxy: {
      '/api': {
        target: 'http://localhost:8765',
        changeOrigin: true
      }
    }
  }
})