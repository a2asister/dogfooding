import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 41287,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:38764',
        changeOrigin: true,
      },
      '/wasm': {
        target: 'http://localhost:38764',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
