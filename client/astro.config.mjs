import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    port: 3000,
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:7001',
          changeOrigin: true,
        },
      },
    },
  },
});
