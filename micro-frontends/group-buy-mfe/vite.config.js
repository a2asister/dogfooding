import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('group-buy-mfe', {
      useDevMode: true
    })
  ],
  server: {
    port: 4003,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/group-buy/',
  build: {
    target: 'esnext',
    lib: {
      name: 'groupBuyMfe',
      entry: 'src/main.js',
      formats: ['umd'],
      fileName: () => 'index.js'
    }
  }
});
