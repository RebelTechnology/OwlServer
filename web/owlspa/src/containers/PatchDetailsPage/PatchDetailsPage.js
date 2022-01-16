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
import classNames from 'classnames';
import { Tag, PatchStats, PatchTileSmall, PatchSoundcloud, PatchDetailsTile } from 'components';
import { PatchPreview, PatchCode } from 'containers';

class PatchDetailsPage extends Component {

  constructor(props){
    super(props);
    const { routeParams, patchDetails } = props;
    let patch = {};

    if(routeParams && patchDetails && patchDetails.patches && routeParams.patchSeoName){
      patch = patchDetails.patches[routeParams.patchSeoName] || {};
    }

    const {
      description='',
      instructions='',
      name='',
      published,
      soundcloud=[],
      parameters=[],
      tags=[]
    } = patch;


    this.state = {
      activeTab: 0,
      showingAbout: true,
      description,
      instructions,
      published,
      name,
      editMode: false,
      soundcloud,
      parameters,
      tags
    };
  }

  patchIsCached(patchSeoName){
    const patchDetails = this.props.patchDetails.patches[patchSeoName];
    return !!(patchDetails && patchDetails.seoName && patchDetails._id);
  }

  currentUserCanEdit(patch){
    if(!patch){
      return false;
    }
    const { currentUser: user } = this.props;
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

  handleChangePublished(published){
    this.setState({
      published
    });
  }

  handleUpdatePatchDetails(properties){
    const { routeParams: {patchSeoName}, patchDetails } = this.props;
    const patch = patchDetails.patches[patchSeoName];

    this.props.serverUpdatePatch({
      ...patch,
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

  handleOnEditPatchClick(){
    this.setState({
      editMode: true
    });
  }

  handleOnCancelEditPatchClick(){
    //revert state
    const { routeParams, patchDetails } = this.props;
    const patch = patchDetails.patches[routeParams.patchSeoName] || {};

    const {
      description='',
      instructions='',
      name='',
      published,
      soundcloud=[],
      parameters=[],
      tags=[]
    } = patch;

    this.setState({
      description,
      instructions,
      published,
      name,
      editMode: false,
      soundcloud,
      parameters,
      tags
    });
  }

  handleOnSavePatchClick(){
    const {
      instructions,
      description,
      name,
      published,
      soundcloud,
      parameters,
      tags
    } = this.state;

    const filteredSoundcloudUrls = soundcloud.filter(url => /^https:\/\/soundcloud\.com\/.+\/.+/.test(url));

    this.setState({
      soundcloud: filteredSoundcloudUrls
    });

    this.handleUpdatePatchDetails({
      instructions,
      description,
      name,
      published,
      soundcloud: filteredSoundcloudUrls,
      parameters,
      tags
    });

  }

  handlePatchNameChange(name){
    this.setState({
      name
    });
  }

  handleChangeSoundCloudArr(soundcloud){
    this.setState({
      soundcloud
    });
  }

  handleChangeParameters(parameters){
    this.setState({
      parameters
    });
  }

  handleChangeTab(_,activeTab,name){
    let showingAbout, showingSource, showingEdit, showingDevice, showingEmulate = false;

    switch (name) {
    case 'Source':
      showingSource = true;
      break;

    case 'Edit':
      showingEdit = true;
      break;

    case 'Emulate':
      showingEmulate = true;
      break;

    case 'Device':
      showingDevice = true;
      break;

    default:
    case 'About':
      showingAbout = true;
      break;
    }

    this.setState({
      showingAbout,
      showingSource,
      showingEmulate,
      showingDevice,
      showingEdit,
      activeTab,
    });
  }

  handleChangeTags(tags){
    this.setState({
      tags
    });
  }

  componentWillReceiveProps(nextProps){
    const {
      patchDetails,
      patchDetails: {
        patchSeoNameChanged
      },
      routeParams: { patchSeoName }
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

    if(nextPatch && thisPatch){
      if(nextPatch.description !== thisPatch.description){
        this.setState({
          description: nextPatch.description
        });
      }

      if(nextPatch.instructions !== thisPatch.instructions){
        this.setState({
          instructions: nextPatch.instructions
        });
      }

      if(nextPatch.name !== thisPatch.name){
        this.setState({
          name: nextPatch.name
        });
      }

      if(nextPatch.published !== thisPatch.published){
        this.setState({
          published: nextPatch.published
        });
      }

    } else if(nextPatch && !thisPatch){
      this.setState({
        instructions: nextPatch.instructions,
        description: nextPatch.description,
        name: nextPatch.name,
        published: nextPatch.published,
        soundcloud: nextPatch.soundcloud || [],
        parameters: nextPatch.parameters || [],
        tags: nextPatch.tags || []
      });
    }

    if(!nextProps.patchDetails.isSaving && this.props.patchDetails.isSaving){
      this.setState({
        editMode: false
      });
    }
  }

  render(){
    const {
      patchDetails,
      currentUser ,
      routeParams: { patchSeoName },
      availableTags
    } = this.props;

    const {
      activeTab,
      instructions,
      description,
      editMode,
      name,
      published,
      soundcloud,
      parameters,
      tags,
      showingAbout,
      showingSource,
      showingEmulate,
      showingDevice,
      showingEdit,
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

          <div className="patch-library">
            <PatchTileSmall
              patch={patch}
              patchName={name}
              canEdit={canEdit}
              editMode={editMode}
              isSaving={patchDetails.isSaving}
              onEditClick={() => this.handleOnEditPatchClick()}
              onSaveClick={() => this.handleOnSavePatchClick()}
              onCancelClick={() => this.handleOnCancelEditPatchClick()}
              onDeletePatchClick={(e)=>this.handleDeletePatchClick(e,patch)}
              onPatchNameChange={patchName => this.handlePatchNameChange(patchName)}
              onChangePublished={published => this.handleChangePublished(published)}
              onStarClick={(e)=> this.handleStarClick(e,patch, starForThisPatch)}
              starred={starred}
              published={published}
            />

            <ul className="tab-nav">
              {['About', 'Device', 'Emulate', 'Source', 'Edit'].map((t,i) => (
                <li onClick={(e) => this.handleChangeTab(e,i,t)}
                    key={i}
                    className={ classNames({active: (i === activeTab)}) }>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="white-box2">
              {showingAbout && (
                <div>
                  <PatchSoundcloud
                    soundcloud={soundcloud}
                    editMode={editMode}
                    isSaving={patchDetails.isSaving}
                    savedSuccess={patchDetails.savedSuccess}
                    onChangeSoundCloudArr={ soundcloudArr => this.handleChangeSoundCloudArr(soundcloudArr)} />

                  <PatchDetailsTile
                    title="Description"
                    text={description}
                    onTextChange={description => this.handlePatchDetailsDescriptionChange(description)}
                    isSaving={patchDetails.isSaving}
                    editMode={editMode}
                  />

                  { (patch.instructions || canEdit) &&
                    <PatchDetailsTile
                      style={{background: 'grey'}}
                      title="Instructions"
                      text={instructions}
                      onTextChange={instructions => this.handlePatchDetailsInstructionsChange(instructions)}
                      isSaving={patchDetails.isSaving}
                      editMode={editMode}
                    />
                  }

                  <PatchStats
                    isSaving={patchDetails.isSaving}
                    availableTagList={availableTags.items}
                    tags={tags}
                    editMode={editMode}
                    onChangeTags={tags => this.handleChangeTags(tags)}
                    patch={patch}
                    isSaving={patchDetails.isSaving}
                  />
                </div>
              )}

              <PatchPreview
                onCompileClick={(e) => this.handleCompileClick(e,patch)}
                editMode={editMode}
                isSaving={patchDetails.isSaving}
                parameters={parameters}
                detailsState={this.state}
                onChangeParameters={parameters => this.handleChangeParameters(parameters)}
                patch={patch} />

              {showingSource && (
                <PatchCode
                  onCompileClick={(e) => this.handleCompileClick(e,patch)}
                  canEdit={canEdit}
                  patch={patch}
                  fileUrls={patch.github} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(){
    const { fetchPatchDetails, routeParams: {patchSeoName}, availableTags } = this.props;
    if(patchSeoName && !this.patchIsCached(patchSeoName)){
      this.props.fetchPatchDetails(patchSeoName);
    }

    if(!availableTags.items || !availableTags.items.length){
      this.props.fetchTags();
    }
  }
};

PatchDetailsPage.contextTypes = {
  router: PropTypes.object.isRequired
};

const mapStateToProps = ({ patchDetails, currentUser, tags }) => ({
    patchDetails,
    currentUser,
    availableTags: tags
});

export default connect(mapStateToProps, {
  fetchPatchDetails,
  fetchTags,
  deletePatch,
  compilePatch,
  setPatchStarAndSendToSever,
  serverUpdatePatch
})(PatchDetailsPage);
