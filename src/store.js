import FormStore from 'mobx-form-store';
import server from './mockServer';

const store = new FormStore({
  name: 'MyStore',
  idProperty: 'id',
  autoSaveInterval: 30 * 1000,
  minRefreshInterval: 15 * 60 * 1000,
  log: console.log.bind(console), // eslint-disable-line no-console
  server,
});

// Store Singleton in window for ease of debugging:
if (typeof window !== 'undefined') {
  window.store = store;
}
export default store;
