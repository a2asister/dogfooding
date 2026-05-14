import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  return {
    plugins: [qwikVite(), tsconfigPaths()],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
    server: {
      port: 3876,
      strictPort: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3877',
          changeOrigin: true,
        },
      },
    },
  };
});
