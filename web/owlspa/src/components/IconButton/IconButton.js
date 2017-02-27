import React, { Component, PropTypes } from 'react';
import { Icon } from 'components';
import CSSModules from 'react-css-modules';
import styles from './IconButton.css';

class IconButton extends Component {

  render(){
    const { onClick, disabled, size, color, name, children, title } = this.props;
    return (
      <button 
        title={title}
        styleName="icon-button"
        style={{
          width: `${children ? 'auto' : size}px`,
          height: `${size}px`,
          lineHeight: `${size}px`,
          top: 0
        }}
        disabled={disabled} 
        onClick={onClick}>
        <Icon color={disabled ? '#999' : color} name={name} />
        { children }
      </button>
    );
  }
};

IconButton.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node
};

IconButton.defaultProps = {
  size: 28,
  color: '#000',
  onClick: () => {},
  disabled: false
};

export default CSSModules(IconButton, styles);