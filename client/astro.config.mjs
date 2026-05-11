import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'http://localhost:43211',
  server: {
    port: 43211,
    host: true
  }
});
