import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchTileSmall.css';
import { IconButton } from 'components';
import { AuthorLink } from 'components';

class PatchTileSmall extends Component {

  handleEditClick(e){
    const { seoName } = this.props.patch;
    window.location = '/edit-patch/' + seoName;
  }
  render(){
    const { patch, canEdit, onDeletePatchClick } = this.props;
    const author = patch.author;
    if(!patch){
      return (
        <div></div>
      )
    }
    return (
      <div styleName="patch-tile-small">
        <div styleName="patch-title">{patch.name}</div>
        { canEdit ? (
          <div styleName="patch-tile-controls">
            <IconButton name="edit" onClick={e => this.handleEditClick(e)}/>
            <IconButton name="delete" onClick={ onDeletePatchClick } />
          </div>) : null
        }    
        { author ? (
          <AuthorLink author={ author.name } />
        ) : null}
      </div>
    );
  }
}

PatchTileSmall.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool,
  onDeletePatchClick: PropTypes.func
}

export default CSSModules(PatchTileSmall, styles);