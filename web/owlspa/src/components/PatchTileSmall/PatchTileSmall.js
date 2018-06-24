import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchTileSmall.css';
import { IconButton, StarCounter, AuthorLink } from 'components';

class PatchTileSmall extends Component {

  constructor(props){
    super(props);
  }

  render(){
    const { 
      patch,
      canEdit,
      editMode,
      isSaving,
      onDeletePatchClick,
      onStarClick,
      starred,
      patchName,
      published
    } = this.props;

    if(!patch){
      return (
        <div></div>
      )
    }
    const starCount = patch.starList ? patch.starList.length : 0;
    const author = patch.author;
    
    let patchVisibilityStyles = {};
    if(published){
      patchVisibilityStyles.background = 'none';
      patchVisibilityStyles.paddingLeft = 0;
    }

    return (
      <div styleName="patch-tile-small">
        <div styleName="patch-title">
          { editMode ? (
            <input
              type="text" 
              style={{backgroundColor: isSaving ? '#bbb' : '#fff'}} 
              disabled={isSaving} 
              value={patchName} 
              onChange={ e => this.props.onPatchNameChange(e.target.value) } 
            />) : patchName
          }   
        </div>
        { canEdit && (
          <div styleName="patch-tile-controls" style={{ marginBottom: '5px' }}>
            
            { !editMode && <IconButton title="edit patch" icon={ isSaving ? 'loading' : 'edit' } disabled={isSaving} onClick={ () => this.props.onEditClick() } /> }
            { editMode && <IconButton title="save" icon={ isSaving ? 'loading' : 'save' } disabled={isSaving} onClick={  () => this.props.onSaveClick() } /> }
            
            <IconButton title="delete patch" icon="delete" onClick={ onDeletePatchClick } /> 
            
            { !editMode && (
              <div className="patch-visibility" style={patchVisibilityStyles} >
                { published ? 'PUBLISHED' : 'PRIVATE'}
              </div>
            )}
          
          </div>)
        } 


        { editMode && (
          <div styleName="patch-title-published-editor">
            <label>
              <input 
                disabled={isSaving}
                type="radio" 
                value="PUBLISHED" 
                name="published" 
                checked={published}
                onChange={e => this.props.onChangePublished(true)} 
              />
              PUBLISHED
            </label>
            <label>
              <input
                disabled={isSaving}
                type="radio" 
                value="PRIVATE" 
                name="published" 
                checked={!published}
                onChange={e => this.props.onChangePublished(false)} 
              />
              PRIVATE
            </label>
          </div>
        )}  
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
  patchName: PropTypes.string,
  published: PropTypes.bool,
  canEdit: PropTypes.bool,
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool,
  onDeletePatchClick: PropTypes.func,
  onChangePublished: PropTypes.func,
  onPatchNameChange: PropTypes.func,
  onStarClick: PropTypes.func,
  starred: PropTypes.bool,
};

PatchTileSmall.defaultProps = {
  onChangePublished: () => {},
  onPatchNameChange: () => {},
  onSaveClick: () => {},
  onEditClick: () => {}
};

export default CSSModules(PatchTileSmall, styles);
