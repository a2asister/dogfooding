const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 19876,
    proxy: {
      '/api': {
        target: 'http://localhost:18765',
        changeOrigin: true
      }
    }
  }
})
