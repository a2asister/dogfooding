import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    port: 45678,
    host: true
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:34567',
          changeOrigin: true
        }
      }
    }
  }
});
