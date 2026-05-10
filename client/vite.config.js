import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 37892,
    proxy: {
      '/api': {
        target: 'http://localhost:58743',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext'
  }
});
