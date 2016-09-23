import React, { Component, PropTypes } from 'react';
import { AuthorLink } from 'components';

class PatchTileSmall extends Component {
  render(){
    const { patch, canEdit, onDeletePatchClick } = this.props;
    const author = patch.author;
    if(!patch){
      return (
        <div></div>
      )
    }
    return (
      <div className="patch-tile-small" id="sticker">
        <div className="patch-title-controls">
          <div>
            <div className="patch-title no-pseudo-link">{patch.name}</div>
            { canEdit ? (
              <div className="patch-buttons">
                <a href={'/edit-patch/' + patch.seoName} className="patch-button patch-button-edit"></a>
                <span onClick={onDeletePatchClick} className="patch-button patch-button-delete"></span>
              </div>) : null
            }    
          </div>
          <div>
            { author ? (
              <AuthorLink author={ author.name } />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

PatchTileSmall.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool,
  onDeletePatchClick: PropTypes.func
}

export default PatchTileSmall;