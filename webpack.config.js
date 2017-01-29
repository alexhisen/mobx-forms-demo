/* eslint-disable import/no-extraneous-dependencies */
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const SplitByPathPlugin = require('webpack-split-by-path');

const HOST = '127.0.0.1';
const PORT = 8080;

const PATHS = {
  vendor: path.join(__dirname, 'node_modules'),
  src: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'www'),
  buildjs: path.join(__dirname, 'www/inc'),
};


const common = {
  entry: {
    app: ['react-hot-loader/patch', PATHS.src],
  },
  output: {
    path: PATHS.buildjs,
    publicPath: 'inc/',
    filename: '[name].js',
    chunkFilename: '[name].js',
    /* can also use: "[name]-[chunkhash].js" */
    // If using dynamic file names, https://github.com/ampedandwired/html-webpack-plugin can help
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.json', '.scss', '.css'],
    moduleDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules'),
    ],
  },
  module: {
    loaders: [
      {
        test: /\.png$/,
        loader: 'url-loader?limit=100000',
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=100000&mimetype=application/font-woff&name=fonts/[hash].[ext]',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=fonts/[hash].[ext]',
        include: path.resolve(__dirname, 'src/fonts'),
      },
      {
        test: /\.svg$/,
        loader: 'file-loader?name=images/[hash].[ext]',
        include: path.resolve(__dirname, 'src/images'),
      },
      {
        test: /\.svg$/,
        loader: 'babel!svg-react',
        include: path.resolve(__dirname, 'src/icons'),
      },
      {
        test: /\.json/,
        loader: 'file-loader?name=models/[hash].[ext]',
        include: path.resolve(__dirname, 'src/models'),
      },
      {
        test: /\.jpg/,
        loader: 'url-loader?name=textures/[hash].[ext]',
        include: path.resolve(__dirname, 'src/textures'),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: path.resolve(__dirname, 'src/models'),
      },
      {
        test: /\.htm$/,
        loader: 'raw-loader',
      },
      {
        test: /\.jsx?$/,
        loader: 'babel?cacheDirectory',
        include: PATHS.src,
      },
    ],
  },
  postcss: () => {
    return [
      /* eslint-disable global-require */
      require('postcss-cssnext'),
      require('postcss-modules-values'),
      /* eslint-enable global-require */
    ];
  },
  plugins: [
    new SplitByPathPlugin([
      /* everything not specified here will go into app.js */
      {
        name: 'vendor',
        path: PATHS.vendor,
      },
    ], {
      manifest: 'app-entry',
    }),
  ],
};

// Setup used to run Hot Module Reload
module.exports = merge(common, {
  entry: {
    app: [
      `webpack-dev-server/client?http://${HOST}:${PORT}/`,
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
      PATHS.src,
    ],
  },
  output: {
    publicPath: `http://${HOST}:${PORT}/inc/`, /* without this, manifest loads fail when base url is a file:// url */
  },
  devtool: 'source-map',
  devServer: {
    contentBase: PATHS.build,

    // Enable history API fallback so HTML5 History API based
    // routing works. This is a good default that will come
    // in handy in more complicated setups.
    historyApiFallback: true,
    hot: true,
    inline: false, /* we have to use an explicit script tag in our index-dev.html so it can parse the url for socket communication */
    progress: true,

    // Display only errors to reduce the amount of output.
    stats: 'errors-only',

    host: HOST,
    port: PORT,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot-loader/webpack', 'babel?cacheDirectory'],
        include: PATHS.src,
      },
      {
        /* index.scss and everything it imports is processed as global CSS, not as CSS Modules */
        test: /index\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap&sourceComments',
        ],
      },
      {
        test: /^((?!index).)*\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap&sourceComments',
        ],
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss?sourceMap&sourceComments',
        ],
      },
    ],
  },
});

