import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 39472,
    proxy: {
      '/api': {
        target: 'http://localhost:63624',
        changeOrigin: true,
      },
    },
  },
})
