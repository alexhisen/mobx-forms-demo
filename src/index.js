import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import './scss/index.scss';

import Form from './Form';

/* eslint-disable */
const { AppContainer } = require('react-hot-loader');
/* eslint-enable */
ReactDOM.render(
  /* eslint-disable react/jsx-filename-extension */
  <AppContainer>
    <Form />
  </AppContainer>,
  document.getElementById('app')
  /* eslint-enable */
);

if (module.hot) {
  module.hot.accept('./Form.jsx', () => {
    /* eslint-disable global-require */
    const NextApp = require('./Form.jsx').default;
    /* eslint-enable */

    ReactDOM.render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      document.getElementById('app'),
    );
  });
}

