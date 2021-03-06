/* eslint-disable import/no-extraneous-dependencies */
const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const extractValues = require('modules-values-extract');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

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

let config;
const reactToolboxVariables = {};

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

const postcssPlugins = () => {
  return [
    /* eslint-disable global-require */
    require('postcss-mixins')(),
    require('postcss-each')(),
    require('postcss-apply')(),
    require('postcss-custom-properties')({
      preserve: false, // returns calculated values instead of variable names
      variables: reactToolboxVariables,
    }),
    require('postcss-preset-env')({
      stage: 0, // enables all postcss-preset-env features to match cssnext
      features: {
        'environment-variables': false, // react-toolbox doesn't use env() but this feature's parser causes problems
        'custom-properties': false,
        'color-mod-function': true, // if you use a stage later than 0
      },
    }),
    require('postcss-calc'), // required as postcss-preset-env doesn't have a reduce calc() function that cssnext did
    require('postcss-modules-values'),
    /* eslint-enable global-require */
  ];
};

const cssLoader = process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader';

const common = {
  entry: {
    app: [],
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
    extensions: ['.jsx', '.js', '.json', '.scss', '.css'],
    modules: [
      'node_modules',
      path.resolve(__dirname, './node_modules'),
    ],
    /* This is not needed in normal use, it's only for development with an npm-linked mobx-schema-form cloned repo: */
    alias: {
      'mobx-schema-form$': PATHS.mobxSchemaForm,
      SchemaFormSaveButton: PATHS.mobxSchemaFormSaveButton,
      react: path.resolve(PATHS.vendor, 'react'),
      mobx: path.resolve(PATHS.vendor, 'mobx'),
      'mobx-react': path.resolve(PATHS.vendor, 'mobx-react'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
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
        /* index.scss and everything it imports is processed as global CSS, not as CSS Modules */
        test: /index\.scss$/,
        use: [
          cssLoader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                mode: 'global',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                sourceComments: true,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          cssLoader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: postcssPlugins,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        }],
      },
    ],
  },
  plugins: [],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
        },
      },
    },
  },
};

if (process.env.NODE_ENV === 'development') {
  // Setup used to run Hot Module Reload
  // This is NOT used when just calling webpack
  config = merge(common, {
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

      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  });
} else if (process.env.NODE_ENV === 'production') {
  config = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    entry: {
      app: [PATHS.src],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          parallel: true,
          sourceMap: true,
          // These are already defaults in uglifyjs - may not need to be set:
          uglifyOptions: {
            compress: {
              drop_console: false, // if we drop console, all window.log functions become undefined
              dead_code: true,
            },
            comments: false,
          },
        }),
        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
          cssProcessorPluginOptions: {
            preset: ['default', {
              calc: false,
              discardComments: { removeAll: true },
            }],
          },
        }),
      ],
    },
  });
} else {
  config = common;
}
