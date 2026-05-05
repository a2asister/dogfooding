import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('flash-sale-mfe', {
      useDevMode: true
    })
  ],
  server: {
    port: 4002,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/flash-sale/',
  build: {
    target: 'esnext',
    lib: {
      name: 'flashSaleMfe',
      entry: 'src/main.js',
      formats: ['umd'],
      fileName: () => 'index.js'
    }
  }
});
