import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 18342,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:23764',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
})
