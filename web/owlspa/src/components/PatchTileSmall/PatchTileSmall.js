import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchTileSmall.css';
import { IconButton, StarCounter, AuthorLink } from 'components';

class PatchTileSmall extends Component {

  handleEditClick(e){
    const { seoName } = this.props.patch;
    window.location = '/edit-patch/' + seoName;
  }

  render(){
    const { patch, canEdit, onDeletePatchClick, seoName, loggedIn, onStarClick, starred } = this.props;
    if(!patch){
      return (
        <div></div>
      )
    }
    const starCount = patch.starList ? patch.starList.length : 0;
    const author = patch.author;

    return (
      <div styleName="patch-tile-small">
        <div styleName="patch-title">{patch.name}</div>
        { canEdit && (
          <div styleName="patch-tile-controls">
            <IconButton title="edit patch" name="edit" onClick={e => this.handleEditClick(e)}/> 
            <IconButton title="delete patch" name="delete" onClick={ onDeletePatchClick } /> 
          </div>)
        }   
        <div styleName="star-counter-wrapper">
          <StarCounter starCount={starCount} starred={starred} onStarClick={ onStarClick } />
        </div>
        { author && <AuthorLink author={ author.name } /> }
      </div>
    );
  }
}

PatchTileSmall.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool,
  onDeletePatchClick: PropTypes.func,
  onStarClick: PropTypes.func,
  loggedIn: PropTypes.bool,
  starred: PropTypes.bool
}

export default CSSModules(PatchTileSmall, styles);