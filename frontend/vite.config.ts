import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 52368,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:52369',
        changeOrigin: true
      },
      '/mock': {
        target: 'http://localhost:52370',
        changeOrigin: true
      }
    }
  }
})
