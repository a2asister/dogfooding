import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isQiankun = mode === 'qiankun'
  
  return {
    plugins: [
      vue(),
      qiankun('transaction-app', { useDevMode: true })
    ],
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    },
    server: {
      port: 3002,
      cors: true,
      origin: 'http://localhost:3002'
    },
    base: isQiankun ? '/transaction/' : '/'
  }
})
