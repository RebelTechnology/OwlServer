import React, { Component, PropTypes } from 'react';
import { AuthorLink } from 'components';

class PatchTileSmall extends Component {
  render(){
    const { patch, canEdit } = this.props;
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
                <span className="patch-button patch-button-edit"></span>
                <span className="patch-button patch-button-delete"></span>
              </div>) : null
            }    
          </div>
          <div>
            <AuthorLink author={patch.author.name} />
          </div>
        </div>
      </div>
    );
  }
}

PatchTileSmall.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool
}

export default PatchTileSmall;