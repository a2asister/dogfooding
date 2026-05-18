import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 33529,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:14587',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:14587',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:14587',
        ws: true,
      },
    },
  },
  build: {
    sourcemap: true,
    target: 'es2020',
  },
});
