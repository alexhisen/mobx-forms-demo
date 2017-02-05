import React from 'react';
import { observable, asReference } from 'mobx';
import { observer } from 'mobx-react';

import combinedSchema from './schema.json';

import Form from './Form';
import SchemaEditor from './SchemaEditor';

@observer class App extends React.Component {
  @observable json = JSON.stringify(combinedSchema, undefined, 2);
  @observable combinedSchema = asReference(combinedSchema); // asReference is needed to prevent mangling arrays

  onChange = (json) => {
    try {
      this.combinedSchema = JSON.parse(json);
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
    this.json = json;
  };

  render() {
    return (
      <div>
        <Form combinedSchema={this.combinedSchema} />
        <SchemaEditor json={this.json} onChange={this.onChange} />
      </div>
    );
  }
}

export default App;
