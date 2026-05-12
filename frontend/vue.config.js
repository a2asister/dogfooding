const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3456,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4321',
        ws: true
      }
    }
  }
})
