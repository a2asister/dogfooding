import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [vue()],
  server: {
    port: 38765,
    host: true,
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:45678',
          changeOrigin: true,
        },
      },
    },
  },
});
