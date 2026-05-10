import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 59876,
    proxy: {
      '/api': {
        target: 'http://localhost:58765',
        changeOrigin: true
      }
    }
  }
})