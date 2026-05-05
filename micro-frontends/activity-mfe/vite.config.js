import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('activity-mfe', {
      useDevMode: true
    })
  ],
  server: {
    port: 4001,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/activity/',
  build: {
    target: 'esnext',
    lib: {
      name: 'activityMfe',
      entry: 'src/main.js',
      formats: ['umd'],
      fileName: () => 'index.js'
    }
  }
});
