import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { name } from './package.json'

export default defineConfig(({ command }) => {
  const dev = command === 'serve'
  
  return {
    plugins: [vue()],
    server: {
      port: 7101,
      cors: true,
      origin: 'http://localhost:7101',
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
        output: {
          inlineDynamicImports: true,
          assetFileNames: '[name].[ext]',
          globals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            pinia: 'Pinia',
            'element-plus': 'ElementPlus',
          },
        },
        external: ['vue', 'vue-router', 'pinia', 'element-plus'],
      },
    },
  }
})
