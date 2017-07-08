import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react';

import AceEditor from 'react-ace';
/* eslint-disable */
// DO NOT npm install brace or those mode/theme files won't load
import brace from 'brace';
import 'brace/mode/json';
import 'brace/theme/monokai';
/* eslint-enable */

@observer class SchemaEditor extends React.Component {
  render() {
    return (
      <AceEditor
        mode="json"
        theme="monokai"
        name="schemaEditor"
        width="60%"
        height="1300px"
        setOptions={{
          tabSize: 2,
          fontSize: 14,
          showGutter: true,
        }}
        value={this.props.json}
        onChange={this.props.onChange}
      />
    );
  }
}

SchemaEditor.propTypes = {
  json: PropTypes.string,
  onChange: PropTypes.func,
};

export default SchemaEditor;
