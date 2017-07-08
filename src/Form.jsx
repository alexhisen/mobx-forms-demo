import PropTypes from 'prop-types';
import React from 'react';
import { observe, action } from 'mobx';
import { observer } from 'mobx-react';
import { MobxSchemaForm, FieldWrapper, validateForm, formShape } from 'mobx-schema-form';
// Uses webpack alias - eslint-import-resolver-webpack should allow Eslint to resolve it but it's not, at least not in Webstorm:
import SaveButton from 'SchemaFormSaveButton'; // eslint-disable-line

import FormErrors from './FormErrors';
import Notification from './Notification';

import store from './store';

let observeDisposer;

function processSchema(combinedSchema) {
  store.options.afterRefresh = async () => {
    // This is a work-around for our mockServer not returning all the fields in the schema
    const keys = Object.keys(combinedSchema.schema.properties);
    const data = Object.assign({}, store.data); // preserves key in data not in schema such as id.
    keys.forEach((key) => {
      key = combinedSchema.schema.properties[key].modelKey || key;
      if (data[key] === undefined) {
        data[key] = null;
      }
    });
    store.reset(data);

    observeDisposer && observeDisposer();
    observeDisposer = observe(store.data, (change) => {
      if (store.isLoading) {
        // ignore changes during refresh from server
        return;
      }

      if (change.name === 'country' && change.oldValue) {
        action(() => {
          store.data.region = null;
        })();
      }
    });

    const onlyWithValues = true;
    validateForm(store.fields, store, onlyWithValues);
  };

  const options = {
    formDefaults: combinedSchema.defaults || {},

    validators: {
      sameAsPassword: (formField, model, value) => {
        if (model.data.password && model.data.password !== value) {
          // can return either object with code or error message string
          return { code: 'notSamePassword' };
        }
        return null;
      },
    },
  };

  options.formDefaults.tickLabelsFormat = (value) => {
    if (value === 12) {
      return '12pm';
    }
    if (value > 12) {
      return `${value - 12}pm`;
    }
    return `${value}am`;
  };

  return options;
}

@observer class Form extends React.Component {
  constructor(props) {
    super(props);
    processSchema(props.combinedSchema);
    store.options.afterRefresh();
  }

  componentDidMount() {
    store.refresh();
  }

  componentWillReceiveProps() {
    // for Hot-Module-Reload
    store.refresh();
  }

  componentWillUnmount() {
    store.save();
    observeDisposer && observeDisposer();
  }

  onSubmit = (e) => {
    e.preventDefault();
  };

  onChange = (key, value) => {
    console.log(key, value); // eslint-disable-line
  };

  render() {
    const combinedSchema = this.props.combinedSchema;
    const options = processSchema(combinedSchema);
    const mapper = {
      fieldWrapper: FieldWrapper,
    };

    return (
      <div>
        <FormErrors model={store} />

        <form onSubmit={this.onSubmit} style={{ maxWidth: 600, width: '40%', paddingRight: '1.4em' }}>
          <MobxSchemaForm
            schema={combinedSchema.schema}
            form={combinedSchema.form}
            model={store}
            options={options}
            mapper={mapper}
            onModelChange={this.onChange}
          />
          <SaveButton
            model={store}
            options={{ allowCreate: true, saveAll: true }}
            label="Save"
            disabled={!store.status.canSave || !store.status.hasChanges}
            type="submit"
          />
        </form>

        <Notification observable={store.saveNotification} label="Saved successfully" />
      </div>
    );
  }
}

Form.propTypes = {
  combinedSchema: PropTypes.shape({
    schema: PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string,
      properties: PropTypes.object.isRequired, /* each key has the schema portion of formShape */
      required: PropTypes.array,
    }).isRequired,
    /* actually a subset of formShape, no schema and some properties in formShape are copied from schema */
    form: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, formShape])),
    /* actually a subset of formShape, no schema and some properties in formShape are copied from schema */
    defaults: formShape,
  }).isRequired,
};

export default Form;
