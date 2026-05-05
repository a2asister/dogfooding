import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('distribution-mfe', {
      useDevMode: true
    })
  ],
  server: {
    port: 4007,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/distribution/',
  build: {
    target: 'esnext',
    lib: {
      name: 'distributionMfe',
      entry: 'src/main.js',
      formats: ['umd'],
      fileName: () => 'index.js'
    }
  }
});
