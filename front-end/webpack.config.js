const path = require('path');

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        exclude: path.resolve(__dirname, 'node_modules'),
        use: ['babel-loader'],
        test: /\.(js|jsx)$/
      },
      {use: ['style-loader','css-loader'], test: /\.css$/},
      //{use: 'url-loader', test: /\.gif$/},
      {use: ['url-loader'], test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/},
    ],
  },
  mode:"development",
  resolve: {
    alias: {
      config$: './configs/app-config.js',
      //react: './vendor/react-master',
    },
    extensions: ['.js', '.jsx', '.css'],
    modules: [
      'node_modules',
      'bower_components',
      'shared',
      '/shared/vendor/modules',
    ],
  },
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        path: path.resolve(__dirname, "target"),
        filename: 'bundle.js',
    },
};