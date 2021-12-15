import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './DevicePageTile.css';
import { IconButton } from 'components';

class DevicePageTile extends Component {

  render(){
    const { title, style, children } = this.props;

    return (
      <div styleName="device-page-tile" style={style}>
        <h2 style={{ textAlign: 'center' }}>{title}</h2>
        { children }
      </div>
    );
  }
}

DevicePageTile.defaultProps = {

}

DevicePageTile.propTypes = {
  title: PropTypes.string,
  style: PropTypes.object
}

export default CSSModules(DevicePageTile, styles);
