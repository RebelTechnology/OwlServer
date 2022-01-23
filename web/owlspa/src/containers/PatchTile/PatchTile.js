import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tag, AuthorLink } from 'components';
import { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot } from 'actions';

class PatchTile extends Component {

  handlePatchClick(e, seoName){
    this.context.router.push('/patch/'+ seoName);
  }

  handleAuthorNameClick(e, authorName){
    e.stopPropagation();
    this.context.router.push('/patches/authors/'+ authorName);
  }

  loadAndRunPatchOnDeviceClick(patch){
    this.props.loadAndRunPatchOnDevice(patch);
  }

  storePatchInDeviceSlotClick(patch){
    const slot = parseInt(window.prompt('Enter a slot number from 0 to 40'));

    if (slot > 0 && slot < 40)
      this.props.storePatchInDeviceSlot(patch, slot);
    else
      window.alert('slot must be a number between 0 and 40 inclusive');
  }

  render(){
    const {
      id,
      name,
      published,
      authorName,
      description,
      tags,
      seoName,
      loggedIn,
      onDeletePatchClick,
      patch,
    } = this.props;

    const {
      isConnected,
      patchIsLoading,
      patchIsStoring,
    } = this.props.owlState;

    return (
      <div className="patch-tile">
        <div className="patch-title-controls">
          <div style={{marginBottom: '10px'}}
               onClick={ (e) => this.handlePatchClick(e, seoName) }>
            <span className="patch-title">{ name }</span>
            { !published && (
              <div className="patch-visibility">
                PRIVATE
              </div>
            )}
          </div>

          <AuthorLink author={authorName} />

          { isConnected && (
            <button
              style={{marginLeft: '10px', padding: '6px 10px'}}
              onClick={() => this.loadAndRunPatchOnDeviceClick(patch)}
              disabled={patchIsLoading}>
              {patchIsLoading ? 'Loading ... ' : 'Load'}
              {patchIsLoading && <i className="loading-spinner"></i> }
            </button>
          )}

          { isConnected && (
            <button
              style={{marginLeft: '10px', padding: '6px 10px'}}
              onClick={() => this.storePatchInDeviceSlotClick(patch)}
              disabled={patchIsStoring}>
              {patchIsStoring ? 'Storing ... ' : 'Store'}
              {patchIsStoring && <i className="loading-spinner"></i> }
            </button>
          )}

          <span className="patch-description-list-view">{ description }</span>
        </div>
        <div className="patch-baseline">
          { tags ?
            tags.map( tagText => {
              return <Tag key={tagText} tag={tagText}/>
            }): null
          }
        </div>
      </div>
    );
  }
}

PatchTile.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  published: PropTypes.bool,
  authorName: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.array,
  loggedIn: PropTypes.bool
}

PatchTile.contextTypes = {
  router: PropTypes.object.isRequired
}

const mapStateToProps = ({ owlState }) => {
  return {
    owlState
  }
}

export default connect(mapStateToProps, { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot })(PatchTile);
