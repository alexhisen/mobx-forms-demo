import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import DevTools from 'mobx-react-devtools';
import { ThemeProvider } from 'react-css-themr';
import theme from './theme';

import combinedSchema from './schema.json';

import Form from './Form';
import SchemaEditor from './SchemaEditor';

@observer class App extends React.Component {
  @observable json = JSON.stringify(combinedSchema, undefined, 2);
  @observable.ref combinedSchema = combinedSchema; // ref (f.k.a. asReference) is needed to prevent mangling arrays

  onChange = (json) => {
    try {
      this.combinedSchema = JSON.parse(json);
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
    this.json = json;
  };

  render() {
    // <DevTools position={{ top: 0, right: 0 }} />)
    return (
      <ThemeProvider theme={theme}>
        <div>
          <Form combinedSchema={this.combinedSchema} />
          <SchemaEditor json={this.json} onChange={this.onChange} />
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
