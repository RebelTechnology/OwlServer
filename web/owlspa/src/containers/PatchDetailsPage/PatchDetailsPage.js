import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { fetchPatchDetails, deletePatch, compilePatch } from 'actions';
import { Tag, PatchStats, PatchTileSmall, PatchSoundcloud } from 'components';
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

  render(){ 
    const { patchDetails, currentUser , routeParams:{patchSeoName} } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    const canEdit = currentUser.isAdmin || this.currentUserCanEdit(patch);

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

            <div className="patch-description">
                <h2>Description</h2>
                <p>{patch.description}</p>
            </div>
            
            { patch.instructions ? (
              <div className="patch-instructions">
                <h2>Instructions</h2>
                <p>{patch.instructions}</p>
              </div>): null 
            } 
            <PatchStats canEdit={canEdit} patch={patch} />
            
          </div>

          <div id="two-thirds" className="patch-library">

            <PatchSoundcloud soundcloud={patch.soundcloud} />

            <PatchPreview onCompileClick={(e) => this.handleCompileClick(e,patch)} canEdit={canEdit} patch={patch} />

            <PatchCode canEdit={canEdit} patchId={patch._id} fileUrls={patch.github} />

          </div>

        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ patchDetails, currentUser }) => {
  return {
    patchDetails,
    currentUser
  }
};

export default connect(mapStateToProps, { fetchPatchDetails, deletePatch, compilePatch })(PatchDetailsPage);
