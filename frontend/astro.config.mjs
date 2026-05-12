import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  server: {
    port: 4396,
    proxy: {
      '/api': {
        target: 'http://localhost:7856',
        changeOrigin: true
      }
    }
  }
});
