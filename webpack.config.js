/* eslint-disable import/no-extraneous-dependencies */
const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const SplitByPathPlugin = require('webpack-split-by-path');
const extractValues = require('modules-values-extract');

const HOST = '127.0.0.1';
const PORT = 8080;

const PATHS = {
  vendor: path.join(__dirname, 'node_modules'),
  src: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'www'),
  buildjs: path.join(__dirname, 'www/inc'),

  // This is not needed in normal use, it's only for development with an npm-linked mobx-schema-form cloned repo:
  // On Windows when doing the npm link between the projects, you must CD to path with uppercase drive letters!
  // (see https://github.com/webpack/webpack/issues/2362)
  // non-debug should be root of package, debug should be src:
  mobxSchemaForm: fs.realpathSync(path.resolve(__dirname, 'node_modules/mobx-schema-form')),
  // non-debug should be lib/SaveButton.js, debug should be src/SaveButton.jsx:
  mobxSchemaFormSaveButton: fs.realpathSync(path.resolve(__dirname, 'node_modules/mobx-schema-form/lib/SaveButton.js')),
};

const reactToolboxVariables = {};

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
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ],
    fallback: path.join(__dirname, 'node_modules'),
    /* This is not needed in normal use, it's only for development with an npm-linked mobx-schema-form cloned repo: */
    alias: {
      'mobx-schema-form$': PATHS.mobxSchemaForm,
      SchemaFormSaveButton: PATHS.mobxSchemaFormSaveButton,
      react: path.resolve(PATHS.vendor, 'react'),
      mobx: path.resolve(PATHS.vendor, 'mobx'),
      'mobx-react': path.resolve(PATHS.vendor, 'mobx-react'),
    },
  },
  resolveLoader: { fallback: path.join(__dirname, 'node_modules') },
  module: {
    loaders: [
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
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.jsx?$/,
        loader: 'babel?cacheDirectory',
        include: [PATHS.src, path.resolve(PATHS.mobxSchemaForm, '..')],
      },
    ],
  },
  postcss: () => {
    return [
      /* eslint-disable global-require */
      require('postcss-cssnext')({
        features: {
          customProperties: {
            variables: reactToolboxVariables,
          },
        },
      }),
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
const config = merge(common, {
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
    inline: false, /* With this set to false, it updates without reloading the whole UI */
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

const cssFiles = fs.readdirSync(path.resolve(PATHS.src, 'css'))
  .filter((file) => file.match(/\.css/i))
  .map((file) => path.resolve(path.resolve(PATHS.src, 'css', file)));

// Note that changes in these variables are not picked up by HMR
module.exports = extractValues({ files: cssFiles }).then((variables) => {
  Object.keys(variables).filter((key) => key.match(/-/)).forEach((key) => {
    reactToolboxVariables[key] = variables[key];
  });
  console.log(reactToolboxVariables); // eslint-disable-line
  return config;
});
