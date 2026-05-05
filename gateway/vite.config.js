import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8000,
    proxy: {
      '/api/logs': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/activities': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/api/flash-sales': {
        target: 'http://localhost:3003',
        changeOrigin: true
      },
      '/api/group-buys': {
        target: 'http://localhost:3004',
        changeOrigin: true
      },
      '/api/groups': {
        target: 'http://localhost:3004',
        changeOrigin: true
      },
      '/api/coupons': {
        target: 'http://localhost:3005',
        changeOrigin: true
      },
      '/api/user-coupons': {
        target: 'http://localhost:3005',
        changeOrigin: true
      },
      '/api/lotteries': {
        target: 'http://localhost:3006',
        changeOrigin: true
      },
      '/api/lottery-records': {
        target: 'http://localhost:3006',
        changeOrigin: true
      },
      '/api/balances': {
        target: 'http://localhost:3007',
        changeOrigin: true
      },
      '/api/transactions': {
        target: 'http://localhost:3007',
        changeOrigin: true
      },
      '/api/products': {
        target: 'http://localhost:3007',
        changeOrigin: true
      },
      '/api/distributors': {
        target: 'http://localhost:3008',
        changeOrigin: true
      },
      '/api/commissions': {
        target: 'http://localhost:3008',
        changeOrigin: true
      },
      '/api/team': {
        target: 'http://localhost:3008',
        changeOrigin: true
      },
      '/api/withdrawals': {
        target: 'http://localhost:3008',
        changeOrigin: true
      }
    }
  }
})
