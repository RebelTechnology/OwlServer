import React, { Component, PropTypes } from 'react';
import iconList from './iconList';

class Icon extends Component {

  render(){
    const { color, name, size=iconList[name].size || 26  } = this.props;

    if(!iconList[name]){
      return null;
    }

    return (
      <svg
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          animation: iconList[name].spin ? 'spin 0.9s infinite linear' : 'none'
        }}
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
  size: PropTypes.number,
  color: PropTypes.string
};

Icon.defaultProps = {
  color: '#000'
};

export default Icon;