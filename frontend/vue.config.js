const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 4567,
    proxy: {
      '/api': {
        target: 'http://localhost:3876',
        changeOrigin: true
      }
    }
  }
})