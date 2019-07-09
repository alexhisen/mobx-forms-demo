import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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
    <TransitionGroup
      className="slideWrapper topNotice"
    >
      {div &&
        <CSSTransition
          classNames="slideDown"
          appear
          timeout={{ appear: 1000, enter: 1000, exit: 300 }}
        >
          {div}
        </CSSTransition>
      }
    </TransitionGroup>
  );
});

FormErrors.propTypes = {
  model: modelShape,
};

export default FormErrors;
