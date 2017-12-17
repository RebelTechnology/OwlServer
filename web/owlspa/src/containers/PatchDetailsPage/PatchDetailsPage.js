import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { 
  fetchPatchDetails,
  fetchTags,
  deletePatch,
  compilePatch,
  serverUpdatePatch,
  setPatchStarAndSendToSever
} from 'actions';
import { Tag, PatchStats, PatchTileSmall, PatchSoundcloud, PatchDetailsTile } from 'components';
import { PatchPreview, PatchCode } from 'containers';

class PatchDetailsPage extends Component {

  constructor(props){
    super(props);
    this.state = {
      description: '',
      instructions: '',
      published: false
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

  getCurrentUserStarForThisPatch(patch, currentUser){
    if (!patch || !patch.starList || !currentUser){
      return false;
    }
    return patch.starList.find(star => star.userId === currentUser.ID);
  }

  handleCompileClick(e,patch){
    e.preventDefault();
    this.props.compilePatch(patch);
  }

  handleDeletePatchClick(e, patch){
    e.preventDefault();
    this.props.deletePatch(patch, {redirect: 'my-patches'});
  }

  handlePatchDetailsDescriptionChange(description){
    this.setState({
      description
    });
  }

  handlePatchDetailsInstructionsChange(instructions){
    this.setState({
      instructions
    });
  }

  updatePatchName(name){
    const { routeParams:{patchSeoName}, patchDetails, serverUpdatePatch } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    const updatedPatch = {
      ...patch,
      name
    };
    serverUpdatePatch(updatedPatch);
  }

  handleSetPublished(published){
    this.handleUpdatePatchDetails({published});
  }

  handleUpdatePatchDetails(properties){
    const { routeParams:{patchSeoName}, patchDetails } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    const {
      instructions,
      description
    } = this.state;

    this.props.serverUpdatePatch({
      ...patch,
      instructions,
      description,
      ...properties
    });
  }

  handleStarClick(e, patch, starForThisPatch){
    e.stopPropagation();
    const { currentUser, setPatchStarAndSendToSever } = this.props;
    const star = starForThisPatch || { userId: currentUser.ID };
    setPatchStarAndSendToSever({
      star,
      add: !starForThisPatch,
      patchSeoName: patch.seoName,
      patchId: patch._id
    });
  }

  componentWillReceiveProps(nextProps){
    const {
      patchDetails,
      patchDetails : {
        patchSeoNameChanged
      },
      routeParams:{ patchSeoName }
    } = this.props;

    const {
      patchDetails: nextPatchDetails,
      routeParams: { patchSeoName: nextPatchSeoName }
    } = nextProps;

    const thisPatch = patchDetails.patches[patchSeoName];
    const nextPatch = nextPatchDetails.patches[nextPatchSeoName];

    if(nextProps.patchDetails.patchSeoNameChanged && !patchSeoNameChanged){
      this.context.router.push('/patch/' + nextProps.patchDetails.patchSeoNameChanged);
    }

    if(nextPatch && (nextPatch !== thisPatch)){
      this.setState({
        instructions: nextPatch.instructions,
        description: nextPatch.description
      });
    }
  }

  render(){ 
    const { 
      patchDetails,
      currentUser ,
      routeParams:{ patchSeoName },
      tags
    } = this.props;

    const {
      instructions,
      description
    } = this.state;

    const patch = patchDetails.patches[patchSeoName];
    const canEdit = currentUser.isAdmin || this.currentUserCanEdit(patch);
    const starForThisPatch = this.getCurrentUserStarForThisPatch(patch, currentUser);
    const starred = !!starForThisPatch;

    if(!patch){
      return <div />
    }

    return (
      <div className="wrapper flexbox">
        <div className="content-container">

          <div id="one-third" className="patch-library">

            <PatchTileSmall 
              patch={patch} 
              patchSeoNameFromRoute={patchSeoName}
              loggedIn={currentUser.loggedIn}
              isSaving={patchDetails.isSaving}
              savedSuccess={patchDetails.savedSuccess}
              canEdit={canEdit} 
              onDeletePatchClick={(e)=>this.handleDeletePatchClick(e,patch)} 
              onUpdatePatchName={patchName => this.updatePatchName(patchName)}
              onSetPublished={(published) => this.handleSetPublished(published)}
              onStarClick={(e)=> this.handleStarClick(e,patch, starForThisPatch)}
              starred={starred}
            />

            <PatchDetailsTile 
              title="Description" 
              text={description}
              onTextChange={description => this.handlePatchDetailsDescriptionChange(description)}
              isSaving={patchDetails.isSaving} 
              canEdit={canEdit} 
              onSave={ () => this.handleUpdatePatchDetails()} 
            />
            
            { (patch.instructions || canEdit ) &&
              <PatchDetailsTile 
                style={{background: 'grey'}} 
                title="Instructions" 
                text={instructions} 
                onTextChange={instructions => this.handlePatchDetailsInstructionsChange(instructions)}
                isSaving={patchDetails.isSaving}
                canEdit={canEdit} 
                onSave={() => this.handleUpdatePatchDetails()} 
              />
            }

            <PatchStats 
              isSaving={patchDetails.isSaving} 
              availableTagList={tags.items} 
              canEdit={canEdit} 
              patch={patch} 
              onSave={({tags}) => this.handleUpdatePatchDetails({tags})}
              isSaving={patchDetails.isSaving}
              savedSuccess={patchDetails.savedSuccess}
            />
            
          </div>

          <div id="two-thirds" className="patch-library">

            <PatchSoundcloud 
              soundcloud={patch.soundcloud} 
              canEdit={canEdit}
              isSaving={patchDetails.isSaving}
              savedSuccess={patchDetails.savedSuccess}
              onSave={soundcloud => this.handleUpdatePatchDetails({soundcloud})}
            />

            <PatchPreview onCompileClick={(e) => this.handleCompileClick(e,patch)} canEdit={canEdit} patch={patch} />

            <PatchCode onCompileClick={(e) => this.handleCompileClick(e,patch)} canEdit={canEdit} patch={patch} fileUrls={patch.github} />

          </div>

        </div>
      </div>
    );
  }

  componentDidMount(){
    const { fetchPatchDetails, routeParams:{patchSeoName}, tags } = this.props;
    if(patchSeoName && !this.patchIsCached(patchSeoName)){
      this.props.fetchPatchDetails(patchSeoName);
    }

    if(!tags.items || !tags.items.length){
      this.props.fetchTags();
    }
  }

}

PatchDetailsPage.contextTypes = {
  router: PropTypes.object.isRequired
};

const mapStateToProps = ({ patchDetails, currentUser, tags }) => {
  return {
    patchDetails,
    currentUser,
    tags
  }
};

export default connect(mapStateToProps, { 
  fetchPatchDetails,
  fetchTags,
  deletePatch,
  compilePatch,
  setPatchStarAndSendToSever,
  serverUpdatePatch
})(PatchDetailsPage);
