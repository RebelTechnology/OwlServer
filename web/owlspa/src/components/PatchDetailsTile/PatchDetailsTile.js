import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchDetailsTile.css';

class PatchDetailsTile extends Component {
  render(){
    const { canEdit, title, text, style } = this.props;

    return (
      <div styleName="patch-details-tile" style={style}>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    );
  }
}

PatchDetailsTile.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  canEdit : PropTypes.bool,
  style: PropTypes.object
}

export default CSSModules(PatchDetailsTile, styles);