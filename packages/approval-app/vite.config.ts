import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const port = 8088

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
      name: 'approvalApp',
      entry: 'src/main.tsx',
      formats: ['umd'],
      fileName: () => 'main.js',
    },
  },
})
