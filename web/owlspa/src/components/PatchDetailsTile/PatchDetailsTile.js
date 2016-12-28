import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchDetailsTile.css';

class PatchDetailsTile extends Component {

  render(){
    const { canEdit, title, text, style, onTextChange, handleEditClick, handleSaveClick, editMode } = this.props;

    return (
      <div styleName="patch-details-tile" style={style}>
        { canEdit && (
            <div>
              { !editMode && <button onClick={ handleEditClick }>edit</button> }
              { editMode && <button onClick={ handleSaveClick }>save</button> }
            </div>
          )
        }
        <h2>{title}</h2>
        { editMode ? (
            <textarea value={text} onChange={ e => onTextChange(e.target.value) }></textarea>
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
  editMode: false,
  text: ''
}

PatchDetailsTile.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  canEdit : PropTypes.bool,
  editMode: PropTypes.bool,
  style: PropTypes.object,
  onTextChange: PropTypes.func,
  handleSaveClick: PropTypes.func,
  handleEditClick: PropTypes.func
}

export default CSSModules(PatchDetailsTile, styles);