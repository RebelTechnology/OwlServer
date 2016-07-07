import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { fetchPatchDetails } from 'actions';
import { Tag, PatchStats, PatchTileSmall, PatchSoundcloud, GitCode } from 'components';
import { PatchPreview } from 'containers';

class PatchDetailsPage extends Component {
  componentWillMount(){
    const { fetchPatchDetails , patchDetails, routeParams:{patchSeoName} } = this.props;
    if(patchSeoName && !this.patchIsCached(patchSeoName)){
      this.props.fetchPatchDetails(patchSeoName);
    }
  }

  patchIsCached(patchSeoName){
    return !!this.props.patchDetails.patches[patchSeoName];
  }

  currentUserCanEdit(patch){
    const { currentUser:user } = this.props;
    const { author } = patch;
    if(author && (user.ID || user.display_name)){
      return author.name === user.display_name || author.wordpressId === user.ID;
    }
    return false;
  }

  render(){ 
    const { patchDetails, currentUser , routeParams:{patchSeoName} } = this.props;
    const patch = patchDetails.patches[patchSeoName];
    console.log('patch', patch);
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

            <PatchTileSmall patch={patch} canEdit={ currentUser.isAdmin || this.currentUserCanEdit(patch) } />

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
            <PatchStats patch={patch} />
            
          </div>

          <div id="two-thirds" className="patch-library">

            <PatchSoundcloud soundcloud={patch.soundcloud} />

            <PatchPreview patch={patch} />

            <GitCode github={patch.github} />

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

export default connect(mapStateToProps, { fetchPatchDetails })(PatchDetailsPage);