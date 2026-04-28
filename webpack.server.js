const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  // 多入口配置：主服务器入口和 SSR 渲染入口
  entry: {
    server: './server/index.js',
    'server-ssr': './src/server/index.js'
  },
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        type: 'asset/inline',
        generator: {
          dataUrl: () => ''
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/inline',
        generator: {
          dataUrl: () => ''
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
