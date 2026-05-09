import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4321,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
