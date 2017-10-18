import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchTileSmall.css';
import { IconButton, StarCounter, AuthorLink } from 'components';

class PatchTileSmall extends Component {

  constructor(props){
    super(props);
    this.state = {
      editMode: false,
      patchName: props.patch.name || ''
    };
  }

  onPatchNameChange(patchName){
    this.setState({
      patchName
    })
  }

  handleEditClick(e){
    this.setState({
      editMode: true
    });
  }

  handleSaveClick(e){
    this.props.onUpdatePatchDetails(this.state.patchName);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.patch.name !== this.props.patch.name){
      this.setState({
        patchName: nextProps.patch.name
      });
    }

    if(nextProps.savedSuccess && !this.props.savedSuccess){
      this.setState({
        editMode: false
      });
    }
  }

  render(){
    const { 
      patch,
      canEdit,
      isSaving,
      onDeletePatchClick,
      seoName,
      loggedIn,
      onStarClick,
      starred,
      patchSeoNameFromRoute 
    } = this.props;
    const { editMode, patchName } = this.state;
    if(!patch){
      return (
        <div></div>
      )
    }
    const starCount = patch.starList ? patch.starList.length : 0;
    const author = patch.author;

    return (
      <div styleName="patch-tile-small">
        <div styleName="patch-title">
          { editMode ? (
            <input
              type="text" 
              style={{backgroundColor: isSaving ? '#bbb' : '#fff'}} 
              disabled={isSaving} 
              value={patchName} 
              onChange={ e => this.onPatchNameChange(e.target.value) } 
            />) : patchName
          }   
        </div>
        { canEdit && (
          <div styleName="patch-tile-controls">
            { !editMode && <IconButton title="edit patch name" name={ isSaving ? 'loading' : 'edit' } disabled={isSaving} onClick={ e => this.handleEditClick(e) } /> }
            { editMode && <IconButton title="save" name={ isSaving ? 'loading' : 'save' } disabled={isSaving} onClick={  e => this.handleSaveClick(e) } /> }
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
  onUpdatePatchDetails: PropTypes.func,
  onStarClick: PropTypes.func,
  loggedIn: PropTypes.bool,
  starred: PropTypes.bool,
  savedSuccess: PropTypes.bool,
  patchSeoNameFromRoute: PropTypes.string
};

export default CSSModules(PatchTileSmall, styles);
