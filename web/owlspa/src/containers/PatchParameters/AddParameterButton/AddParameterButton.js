import React, { PropTypes } from 'react';
import { Icon } from 'components';
import CSSModules from 'react-css-modules';
import styles from './AddParameterButton.css';

const AddParameterButton = props => {
  return (
    <div styleName="wrapper" onClick={props.onClick}>
      <div styleName="button">
        <Icon name="plusSymbol" size={20} color="#fff" />
      </div>
      <span>{props.text}</span>
    </div>
  );
};

AddParameterButton.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string
}

AddParameterButton.defaultProps = {
  onClick: () => {},
  text: 'add'
};

export default CSSModules(AddParameterButton, styles);