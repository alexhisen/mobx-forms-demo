import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { observer } from 'mobx-react';

import { modelShape } from 'mobx-schema-form';

import style from './FormErrors.css';

const FormErrors = observer((props) => {
  let div = null;
  if (props.model.status.errors.length > 0) {
    div = (
      <div className={style.container} key="FormErrors">
        {`${props.model.status.errors.join(', ')}.`}
      </div>
    );
  }

  return (
    <ReactCSSTransitionGroup
      className="slideWrapper topNotice"
      transitionName="slideDown"
      transitionAppear
      transitionAppearTimeout={1000}
      transitionEnterTimeout={1000}
      transitionLeaveTimeout={300}
    >
      {div}
    </ReactCSSTransitionGroup>
  );
});

FormErrors.propTypes = {
  model: modelShape,
};

export default FormErrors;
