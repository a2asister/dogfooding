import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';

const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '5173');
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3000');

export default defineConfig({
  plugins: [
    svelte(),
    UnoCSS({
      configFile: './uno.config.js'
    })
  ],
  server: {
    port: FRONTEND_PORT,
    strictPort: false,
    proxy: {
      '/api': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true
      }
    }
  }
});
