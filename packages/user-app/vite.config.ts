import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const port = 8081

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    target: 'esnext',
    lib: {
      name: 'userApp',
      entry: 'src/main.tsx',
      formats: ['umd'],
      fileName: () => 'main.js',
    },
  },
})
