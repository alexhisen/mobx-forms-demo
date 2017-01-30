import React from 'react';
import { Snackbar } from 'react-toolbox/lib/snackbar';
import { observer } from 'mobx-react';

@observer class Notification extends React.Component {
  componentWillUnmount() {
    this.onSnackbarTimeout();
  }
  onSnackbarTimeout = () => {
    this.props.observable.active = false;
  };

  render() {
    return (
      <Snackbar
        timeout={5000}
        icon={this.props.type === 'error' ? 'error' : null}
        className={this.props.type === 'error' ? 'errorNotification' : ''}
        {...this.props}
        type={this.props.type === 'error' ? null : this.props.type}
        onTimeout={this.onSnackbarTimeout}
        active={this.props.observable.active}
      />
    );
  }
}

Notification.propTypes = {
  type: React.PropTypes.oneOf(['error', 'warning', 'accept', 'cancel', null]),
  observable: React.PropTypes.shape({
    active: React.PropTypes.bool.isRequired,
  }).isRequired,
};

export default Notification;
