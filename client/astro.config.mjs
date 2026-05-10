import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  server: {
    port: 4321
  },
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:8765',
        '/graphql': 'http://localhost:8765',
        '/uploads': 'http://localhost:8765'
      }
    }
  }
});
