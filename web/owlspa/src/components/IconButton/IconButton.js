import React, { Component, PropTypes } from 'react';
import { Icon } from 'components';
import CSSModules from 'react-css-modules';
import styles from './IconButton.css';

class IconButton extends Component {

  render(){
    const { onClick, disabled, size, color, name } = this.props;
    return (
      <button 
        styleName="icon-button"
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
        disabled={disabled} 
        onClick={onClick}>
        <Icon color={disabled ? '#999' : color} name={name} />
      </button>
    );
  }
};

IconButton.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

IconButton.defaultProps = {
  size: 28,
  color: '#000',
  onClick: () => {},
  disabled: false
};

export default CSSModules(IconButton, styles);