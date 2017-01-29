import React from 'react';
import { observer } from 'mobx-react';
import { MobxSchemaForm } from 'mobx-schema-form';
import SaveButton from 'mobx-schema-form/lib/SaveButton';
import model from './store';

/* eslint-disable quotes, quote-props, comma-dangle */
// typically this would be in an external static json file
const schemaJson = {
  "schema": {
    "type": "object",
    "title": "MySchema",
    "properties": {
      "firstName": {
        "title": "First Name",
        "type": "string"
      },
      "lastName": {
        "title": "Last Name",
        "type": "string"
      },
      "email": {
        "title": "Email",
        "type": "string",
        "pattern": "^[A-Za-z0-9!#-'\\*\\+\\-/=\\?\\^_`\\{-~]+(\\.[A-Za-z0-9!#-'\\*\\+\\-/=\\?\\^_`\\{-~]+)*@[A-Za-z0-9!#-'\\*\\+\\-/=\\?\\^_`\\{-~]+(\\.[A-Za-z0-9!#-'\\*\\+\\-/=\\?\\^_`\\{-~]+)*$",
        "validationMessage": {
          "default":"Email must be of proper format: abc@xyz.com",
          "302": "Email is required"
        }
      },
      "phone": {
        "title": "Phone Number",
        "type": "string"
      }
    },
    "required": ["email"]
  },
  "form": [
    "firstName",
    "lastName",
    {
      "key": "email",
      "type": "email"
    },
    "phone"
  ]
};
/* eslint-enable */

@observer class Form extends React.Component {
  componentDidMount() {
    model.refresh();
  }

  onSubmit = (e) => {
    e.preventDefault();
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <MobxSchemaForm
          schema={schemaJson.schema}
          form={schemaJson.form}
          model={model}
        />
        <SaveButton
          model={model}
          options={{ allowCreate: true, saveAll: true }}
          label="Save"
          disabled={!model.status.canSave}
          type="submit"
        />
      </form>
    );
  }
}

export default Form;
