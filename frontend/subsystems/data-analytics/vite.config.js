import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { name } from './package.json'

export default defineConfig(({ command }) => {
  const dev = command === 'serve'
  
  return {
    plugins: [vue()],
    server: {
      port: 7102,
      cors: true,
      origin: 'http://localhost:7102',
    },
    base: dev ? '/' : `/${name}/`,
    build: {
      target: 'esnext',
      lib: {
        name: `${name}`,
        entry: 'src/main.js',
        formats: ['umd'],
        fileName: (format) => `${name}.${format}.js`,
      },
      rollupOptions: {
        external: ['vue', 'vue-router', 'pinia', 'element-plus', 'echarts'],
        output: {
          globals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            pinia: 'Pinia',
            'element-plus': 'ElementPlus',
            'echarts': 'echarts',
          },
        },
      },
    },
  }
})
