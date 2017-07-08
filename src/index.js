import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { overrideComponentTypeChecker } from 'react-toolbox/lib/utils/is-component-of-type';

import './scss/index.scss';

import App from './App';

// Work-around for react-hot-loader issue in React-Toolbox - see https://github.com/react-toolbox/react-toolbox/pull/1164
overrideComponentTypeChecker((classType, reactElement) => {
  return reactElement && (
      reactElement.type === classType ||
      reactElement.type.name === classType.displayName
    );
});

/* eslint-disable */
const { AppContainer } = require('react-hot-loader');
/* eslint-enable */
ReactDOM.render(
  /* eslint-disable react/jsx-filename-extension */
  <AppContainer>
    <App />
  </AppContainer>,
  document.getElementById('app')
  /* eslint-enable */
);

if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    /* eslint-disable global-require */
    const NextApp = require('./App.jsx').default;
    /* eslint-enable */

    ReactDOM.render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      document.getElementById('app'),
    );
  });
}

