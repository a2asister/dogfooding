import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('points-mfe', {
      useDevMode: true
    })
  ],
  server: {
    port: 4006,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/points/',
  build: {
    target: 'esnext',
    lib: {
      name: 'pointsMfe',
      entry: 'src/main.js',
      formats: ['umd'],
      fileName: () => 'index.js'
    }
  }
});
