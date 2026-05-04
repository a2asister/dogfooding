import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { name } from './package.json'

export default defineConfig(({ command }) => {
  const dev = command === 'serve'
  
  return {
    plugins: [vue()],
    server: {
      port: 7103,
      cors: true,
      origin: 'http://localhost:7103',
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
        external: ['vue', 'vue-router', 'pinia', 'element-plus'],
        output: {
          globals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            pinia: 'Pinia',
            'element-plus': 'ElementPlus',
          },
        },
      },
    },
  }
})
