import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './Icon.css';
import iconList from './iconList';

class Icon extends Component {

  render(){
    const { color, name, textPosition, size=iconList[name].size || 26  } = this.props;

    if(!iconList[name]){
      return null;
    }

    let styleOverrides = {
      animation: iconList[name].spin ? 'spin 0.9s infinite linear' : 'none'
    };

    if(textPosition === 'bottom'){
      styleOverrides = {
        ...styleOverrides,
        display: 'block',
        margin: '0 auto 7px auto'
      }
    }

    return (
      <svg
        styleName="icon"
        style={styleOverrides}
        width={`${size}px`}
        height={`${size}px`}
        viewBox={iconList[name].viewBox}
      >
        <path
          style={{ fill: color }}
          d={iconList[name].path}
        ></path>
      </svg>
    );
  }
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  textPosition: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string
};

Icon.defaultProps = {
  color: '#000'
};

export default CSSModules(Icon, styles);