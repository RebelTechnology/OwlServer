import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchDetailsTile.css';
import { IconButton } from 'components';

class PatchDetailsTile extends Component {

  render(){
    const { title, style, isSaving, text, editMode } = this.props;

    return (
      <div styleName="patch-details-tile" style={style}>
        <h2 style={{ marginBottom: '10px' }}>{title}</h2>
        { editMode ? (
            <textarea
              style={{backgroundColor: isSaving ? '#bbb' : '#fff'}}
              disabled={isSaving}
              value={text}
              onChange={ e => this.props.onTextChange(e.target.value) }
            />
          ) : (
            <p>{text}</p>
          )
        }
      </div>
    );
  }
}

PatchDetailsTile.defaultProps = {
  onTextChange: () => {},
  onSave: () => {},
  text: ''
}

PatchDetailsTile.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  isSaving: PropTypes.bool,
  style: PropTypes.object,
  onTextChange: PropTypes.func
}

export default CSSModules(PatchDetailsTile, styles);
