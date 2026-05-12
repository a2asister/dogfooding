const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 9876,
    proxy: {
      '/graphql': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
    },
  },
});
