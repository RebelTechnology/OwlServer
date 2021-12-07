import React, { Component, PropTypes } from 'react';
import { Icon } from 'components';
import CSSModules from 'react-css-modules';
import styles from './IconButton.css';

class IconButton extends Component {

  render(){
    const { onClick, disabled, size, color, icon, children, title, style } = this.props;

    const styles = {
      width: `${children ? 'auto' : size}px`,
      height: `${size}px`,
      lineHeight: `${size}px`,
      top: 0,
      ...style
    };

    return (
      <button
        title={title}
        styleName="icon-button"
        style={styles}
        disabled={disabled}
        onClick={onClick}>
        <Icon color={disabled ? '#999' : color} name={icon} />
        { children }
      </button>
    );
  }
};

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  style: PropTypes.object
};

IconButton.defaultProps = {
  size: 28,
  color: '#000',
  onClick: () => {},
  disabled: false,
  style: {}
};

export default CSSModules(IconButton, styles);
