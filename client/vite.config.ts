import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 48732,
    proxy: {
      '/api': {
        target: 'http://localhost:39571',
        changeOrigin: true
      }
    }
  }
})
