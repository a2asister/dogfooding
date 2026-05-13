import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3978,
    proxy: {
      '/graphql': {
        target: 'http://localhost:3979',
        changeOrigin: true,
      },
    },
  },
});
