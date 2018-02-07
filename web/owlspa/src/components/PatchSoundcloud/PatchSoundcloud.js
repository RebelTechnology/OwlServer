import React, { Component, PropTypes } from 'react';
import { IconButton } from 'components';

class PatchSoundcloud extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      editMode: false,
      soundcloud: props.soundcloud
    }
  }

  getSoundcloudSrcUrl(src){
    return 'https://w.soundcloud.com/player/?url=' + 
    encodeURIComponent(src) +
    '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true'
  }

  handleEditSoundCloudClick(){
    this.setState({
      editMode: true
    });
  }
  
  handleSoundCloudUrlChange(i, value){
    const updatedSoundcloud = [
      ...this.state.soundcloud
    ];

    updatedSoundcloud[i] = value;

    this.setState({
      soundcloud: updatedSoundcloud
    });
  
  }

  handleAddSoundCloudClick(){
    const {
      soundcloud
    } = this.state;

    this.setState({
      soundcloud: [
        ...soundcloud,
        ''
      ]
    });
  }

  handleDeleteSoundCloudClick(i){
    const updatedSoundcloud = [
      ...this.state.soundcloud
    ];

    updatedSoundcloud.splice(i, 1)

    this.setState({
      soundcloud: updatedSoundcloud
    });
  }

  handleSaveSoundCloudClick(){
    const {
      soundcloud
    } = this.state;

    const soundcloudToSave = soundcloud.filter( url => !!url);
    //TODO validate soundcloud urls before saving, perhaps do it as the user types it, the save button is disabled until valid.
    this.props.onSave(soundcloudToSave);
  }

  handleCancelSoundCloudClick(){
    const {
      soundcloud
    } = this.props;

    this.setState({
      editMode: false,
      soundcloud
    });
  }

  containsDifferentSoundCloud(nextProps){
    if(nextProps.soundcloud.length !== this.props.soundcloud.length){
      return true;
    }

    return !nextProps.soundcloud.every( (url, i) => this.props.soundcloud[i] === url);
  }

  componentWillReceiveProps(nextProps){
    const {
      savedSuccess,
      soundcloud
    } = this.props;

    if(!savedSuccess && nextProps.savedSuccess){
      this.setState({
        editMode: false
      });
    }

    if(this.containsDifferentSoundCloud(nextProps)){
      this.setState({
        soundcloud: nextProps.soundcloud
      });
    }
  }

  render(){
    const { 
      soundcloud,
      editMode
    } = this.state;

    const {
      canEdit,
      isSaving
    } = this.props;

    return (
      <div>
        <div className="patch-soundcloud">
        { soundcloud.map((src, i) => {
            return canEdit && editMode ? 
            ( <div key={i}>
                <input 
                  style={{
                    width: '80%',
                    maxWidth: '700px',
                    display: 'inline-block'
                  }}
                  type="text" 
                  placeholder="https://soundcloud.com/"
                  value={src} 
                  disabled={isSaving}
                  onChange={(e) => this.handleSoundCloudUrlChange(i, e.target.value) } 
                />
                <IconButton 
                  title="delete this soundcloud link" 
                  icon={ isSaving ? 'loading' : 'delete' } 
                  disabled={isSaving}
                  onClick={e => this.handleDeleteSoundCloudClick(i)} />
              </div>
            ) : (
              <iframe 
                key={i} 
                width="100%" 
                height="250" 
                scrolling="no" 
                frameBorder="no" 
                src={this.getSoundcloudSrcUrl(src)}>
              </iframe>
            );
        })}
        { canEdit && editMode && (
          <div>
            <button 
              className="btn-small" 
              style={{
                lineHeight: '6px',
                margin: '2px'
              }}
              disabled={isSaving} 
              onClick={ e => this.handleAddSoundCloudClick()} >
              Add A Link
            </button>
            <button 
              className="btn-small" 
              style={{
                lineHeight: '6px',
                margin: '2px'
              }}
              disabled={isSaving} 
              onClick={ e => this.handleSaveSoundCloudClick()} >
              { isSaving ? '...saving' : 'save'  }
            </button>
            <button 
              className="btn-small" 
              style={{
                lineHeight: '6px',
                margin: '2px'
              }}
              disabled={isSaving} 
              onClick={ e => this.handleCancelSoundCloudClick()} >
              cancel
            </button>
          </div>
        )}
        { canEdit && !editMode && (
          <div>
            <IconButton 
              title="edit soundcloud links" 
              icon={ isSaving ? 'loading' : 'edit' } 
              disabled={isSaving}
              onClick={e => this.handleEditSoundCloudClick(e)}>
              Soundcloud links
            </IconButton>
          </div>
        )}
        </div>
      </div>
    );
  }
}

PatchSoundcloud.propTypes = {
  soundCloud: PropTypes.array,
  isSaving: PropTypes.bool,
  savedSuccess: PropTypes.bool,
  onSave: PropTypes.func
};

PatchSoundcloud.defaultProps = {
  onSave: () => {},
  soundcloud: []
};

export default PatchSoundcloud;
