import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 45678,
    proxy: {
      '/graphql': {
        target: 'http://localhost:38766',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
