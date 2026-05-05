import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('coupon-mfe', {
      useDevMode: true
    })
  ],
  server: {
    port: 4004,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/coupon/',
  build: {
    target: 'esnext',
    lib: {
      name: 'couponMfe',
      entry: 'src/main.js',
      formats: ['umd'],
      fileName: () => 'index.js'
    }
  }
});
