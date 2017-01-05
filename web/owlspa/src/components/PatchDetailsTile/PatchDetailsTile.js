import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchDetailsTile.css';
import { IconButton } from 'components';

class PatchDetailsTile extends Component {

  render(){
    const { canEdit, title, text, style, onTextChange, handleEditClick, handleSaveClick, editMode, isSaving } = this.props;

    return (
      <div styleName="patch-details-tile" style={style}>
        { canEdit && (
            <div styleName="patch-tile-controls">
              { !editMode && <IconButton name={ isSaving ? 'loading' : 'edit' } disabled={isSaving} onClick={ handleEditClick } /> }
              { editMode && <IconButton name={ isSaving ? 'loading' : 'save' } disabled={isSaving} onClick={ handleSaveClick } /> }
            </div>
          )
        }
        <h2>{title}</h2>
        { editMode ? (
            <textarea 
              style={{backgroundColor: isSaving ? '#bbb' : 'intial'}} 
              disabled={isSaving} 
              value={text} 
              onChange={ e => onTextChange(e.target.value) } 
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
  handleSaveClick: () => {},
  handleEditClick: () => {},
  isSaving: false,
  editMode: false,
  text: ''
}

PatchDetailsTile.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  canEdit : PropTypes.bool,
  isSaving: PropTypes.bool,
  editMode: PropTypes.bool,
  style: PropTypes.object,
  onTextChange: PropTypes.func,
  handleSaveClick: PropTypes.func,
  handleEditClick: PropTypes.func
}

export default CSSModules(PatchDetailsTile, styles);