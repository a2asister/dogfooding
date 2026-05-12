import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 9823,
    proxy: {
      '/api': {
        target: 'http://localhost:5876',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
