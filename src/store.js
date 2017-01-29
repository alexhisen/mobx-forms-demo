import FormStore from 'mobx-form-store';
import server from './mockServer';

const store = new FormStore({
  name: 'MyStore',
  idProperty: 'id',
  log: console.log.bind(console), // eslint-disable-line no-console
  server,
});

export default store;
