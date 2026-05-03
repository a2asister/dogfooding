import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const port = 3001;

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    cors: true,
    origin: `http://localhost:${port}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: 'umd',
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: '[ext]/[name].[hash].[ext]',
      },
    },
  },
});
