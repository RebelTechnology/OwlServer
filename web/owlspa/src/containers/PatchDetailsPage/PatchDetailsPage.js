import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { 
  fetchPatchDetails,
  deletePatch,
  compilePatch,
  serverSavePatchAndExitEditMode,
  setEditModeForPatchDetails,
  editPatchDetails
} from 'actions';
import { Tag, PatchStats, PatchTileSmall, PatchSoundcloud, PatchDetailsTile } from 'components';
import { PatchPreview, PatchCode } from 'containers';

class PatchDetailsPage extends Component {
  componentWillMount(){
    const { fetchPatchDetails , patchDetails, routeParams:{patchSeoName} } = this.props;
    if(patchSeoName && !this.patchIsCached(patchSeoName)){
      this.props.fetchPatchDetails(patchSeoName);
    }
  }

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

  savePatchDetails(){
    const { routeParams:{patchSeoName}, patchDetails, serverSavePatchAndExitEditMode } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    serverSavePatchAndExitEditMode(patch);
  }

  handleDescriptionEditClick(){
    const {setEditModeForPatchDetails, routeParams:{patchSeoName}} = this.props;
    setEditModeForPatchDetails(patchSeoName, {description: true});
  }

  handleInstructionsEditClick(){
    const {setEditModeForPatchDetails, routeParams:{patchSeoName}} = this.props;
    setEditModeForPatchDetails(patchSeoName, {instructions: true});
  }

  render(){ 
    const { patchDetails, currentUser , routeParams:{patchSeoName}, patchDetailsEditMode } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    const canEdit = currentUser.isAdmin || this.currentUserCanEdit(patch);
    const descriptionEditMode = patchDetailsEditMode[patchSeoName] && patchDetailsEditMode[patchSeoName].description;
    const instructionsEditMode = patchDetailsEditMode[patchSeoName] && patchDetailsEditMode[patchSeoName].instructions;

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

            <PatchTileSmall patch={patch} canEdit={canEdit} onDeletePatchClick={(e)=>this.handleDeletePatchClick(e,patch)} />

            <PatchDetailsTile 
              title="Description" 
              text={patch.description} 
              canEdit={canEdit} 
              editMode={descriptionEditMode}
              onTextChange={val => this.handlePatchDecriptionChange(val)}
              handleEditClick={e => this.handleDescriptionEditClick(e)}
              handleSaveClick={e => this.savePatchDetails(e)} />
            
            { (patch.instructions || canEdit ) &&
              <PatchDetailsTile 
                style={{background: 'grey'}} 
                title="Instructions" 
                text={patch.instructions} 
                canEdit={canEdit} 
                editMode={instructionsEditMode}
                onTextChange={(val) => this.handlePatchInstructionsChange(val)} 
                handleEditClick={e => this.handleInstructionsEditClick(e)}
                handleSaveClick={e => this.savePatchDetails(e)} />
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
  serverSavePatchAndExitEditMode,
  setEditModeForPatchDetails,
  editPatchDetails
})(PatchDetailsPage);