import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { 
  fetchPatchDetails,
  deletePatch,
  compilePatch,
  serverUpdatePatchAndExitEditMode,
  setEditModeForPatchDetails,
  editPatchDetails,
  setPatchStar
} from 'actions';
import { Tag, PatchStats, PatchTileSmall, PatchSoundcloud, PatchDetailsTile } from 'components';
import { PatchPreview, PatchCode } from 'containers';

class PatchDetailsPage extends Component {

  patchIsCached(patchSeoName){
    const patchDetails = this.props.patchDetails.patches[patchSeoName];
    return !!(patchDetails && patchDetails.seoName && patchDetails._id);
  }

  currentUserCanEdit(patch){
    if(!patch){
      return false;
    }
    const { currentUser:user } = this.props;
    const { author } = patch;
    if(author && (user.ID || user.display_name)){
      return author.name === user.display_name || author.wordpressId === user.ID;
    }
    return false;
  }

  currentUserHasStarred(patch, currentUser){
    if (!patch || !patch.starList || !currentUser){
      return false;
    }
    return patch.starList.some(star => star.user === currentUser.display_name);
  }

  handleCompileClick(e,patch){
    e.preventDefault();
    this.props.compilePatch(patch);
  }

  handleDeletePatchClick(e, patch){
    e.preventDefault();
    this.props.deletePatch(patch, {redirect: 'my-patches'});
  }

  handlePatchDecriptionChange(description){
    const {editPatchDetails, routeParams:{patchSeoName}, patchDetails} = this.props;
    editPatchDetails(patchSeoName, {description});
  }

  handlePatchInstructionsChange(instructions){
    const {editPatchDetails, routeParams:{patchSeoName}, patchDetails} = this.props;
    editPatchDetails(patchSeoName, {instructions});
  }

  updatePatchDetails(){
    const { routeParams:{patchSeoName}, patchDetails, serverUpdatePatchAndExitEditMode } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    serverUpdatePatchAndExitEditMode(patch);
  }

  handleDescriptionEditClick(){
    const {setEditModeForPatchDetails, routeParams:{patchSeoName}} = this.props;
    setEditModeForPatchDetails(patchSeoName, {description: true});
  }

  handleInstructionsEditClick(){
    const {setEditModeForPatchDetails, routeParams:{patchSeoName}} = this.props;
    setEditModeForPatchDetails(patchSeoName, {instructions: true});
  }

  handleStarClick(e, patch, starred){
    e.stopPropagation();
    const { currentUser, setPatchStar } = this.props;
    setPatchStar({
      user: currentUser.display_name,
      starred: !starred,
      patchSeoName: patch.seoName
    });
  }

  render(){ 
    const { patchDetails, currentUser , routeParams:{patchSeoName}, patchDetailsEditMode } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    const canEdit = currentUser.isAdmin || this.currentUserCanEdit(patch);
    const descriptionEditMode = patchDetailsEditMode[patchSeoName] && patchDetailsEditMode[patchSeoName].description;
    const instructionsEditMode = patchDetailsEditMode[patchSeoName] && patchDetailsEditMode[patchSeoName].instructions;
    const starred = this.currentUserHasStarred(patch, currentUser);

    if(!patch){
      return (
        <div>
        </div>
      );
    }

    return (
      <div className="wrapper flexbox">
        <div className="content-container">

          <div id="one-third" className="patch-library">

            <PatchTileSmall 
              patch={patch} 
              loggedIn={currentUser.loggedIn} 
              canEdit={canEdit} 
              onDeletePatchClick={(e)=>this.handleDeletePatchClick(e,patch)} 
              onStarClick={(e)=> this.handleStarClick(e,patch, starred)}
              starred={starred}
            />

            <PatchDetailsTile 
              title="Description" 
              text={patch.description}
              isSaving={patchDetails.isSaving} 
              canEdit={canEdit} 
              editMode={descriptionEditMode}
              onTextChange={val => this.handlePatchDecriptionChange(val)}
              handleEditClick={e => this.handleDescriptionEditClick(e)}
              handleSaveClick={e => this.updatePatchDetails(e)} 
            />
            
            { (patch.instructions || canEdit ) &&
              <PatchDetailsTile 
                style={{background: 'grey'}} 
                title="Instructions" 
                text={patch.instructions} 
                isSaving={patchDetails.isSaving}
                canEdit={canEdit} 
                editMode={instructionsEditMode}
                onTextChange={(val) => this.handlePatchInstructionsChange(val)} 
                handleEditClick={e => this.handleInstructionsEditClick(e)}
                handleSaveClick={e => this.updatePatchDetails(e)} 
              />
            }

            <PatchStats canEdit={canEdit} patch={patch} />
            
          </div>

          <div id="two-thirds" className="patch-library">

            <PatchSoundcloud soundcloud={patch.soundcloud} />

            <PatchPreview onCompileClick={(e) => this.handleCompileClick(e,patch)} canEdit={canEdit} patch={patch} />

            <PatchCode onCompileClick={(e) => this.handleCompileClick(e,patch)} canEdit={canEdit} patch={patch} fileUrls={patch.github} />

          </div>

        </div>
      </div>
    );
  }

  componentDidMount(){
    const { fetchPatchDetails , patchDetails, routeParams:{patchSeoName} } = this.props;
    if(patchSeoName && !this.patchIsCached(patchSeoName)){
      this.props.fetchPatchDetails(patchSeoName);
    }
  }

}

const mapStateToProps = ({ patchDetails, patchDetailsEditMode, currentUser }) => {
  return {
    patchDetails,
    patchDetailsEditMode,
    currentUser
  }
};

export default connect(mapStateToProps, { 
  fetchPatchDetails,
  deletePatch,
  compilePatch,
  setPatchStar,
  serverUpdatePatchAndExitEditMode,
  setEditModeForPatchDetails,
  editPatchDetails
})(PatchDetailsPage);