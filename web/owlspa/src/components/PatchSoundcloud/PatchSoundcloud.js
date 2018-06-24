import React, { Component, PropTypes } from 'react';
import { IconButton } from 'components';

class PatchSoundcloud extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      soundcloud: props.soundcloud
    }
  }

  getSoundcloudSrcUrl(src){
    return 'https://w.soundcloud.com/player/?url=' + 
    encodeURIComponent(src) +
    '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true'
  }

  handleSoundCloudUrlChange(i, value){
    const updatedSoundcloud = [
      ...this.props.soundcloud
    ];

    updatedSoundcloud[i] = value;

    this.props.onChangeSoundCloudArr(updatedSoundcloud);
  
  }

  handleAddSoundCloud(){
    const {
      soundcloud
    } = this.props;

    this.props.onChangeSoundCloudArr([ ...soundcloud, '']);
  }

  handleDeleteSoundCloud(i){
    const updatedSoundcloud = [
      ...this.props.soundcloud
    ];

    updatedSoundcloud.splice(i, 1)

    this.props.onChangeSoundCloudArr(updatedSoundcloud);
  }

  render(){
    const {
      soundcloud,
      editMode,
      isSaving
    } = this.props;

    const styles = {};
    if(!soundcloud.length){
      styles.marginBottom = 0;
    }

    return (
      <div className="patch-soundcloud" style={styles}>
        { soundcloud.map((src, i) => {
            return editMode ? 
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
                  onClick={e => this.handleDeleteSoundCloud(i)} />
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
        { editMode && (
          <div>
            <button 
              className="btn-small" 
              style={{
                lineHeight: '6px',
                margin: '2px'
              }}
              disabled={isSaving} 
              onClick={ e => this.handleAddSoundCloud()} >
              Add A Soundcloud Link
            </button>
          </div>
        )}
      </div>
    );
  }
}

PatchSoundcloud.propTypes = {
  soundCloud: PropTypes.array,
  onChangeSoundCloudArr: PropTypes.func,
  isSaving: PropTypes.bool,
  editMode: PropTypes.bool,
  savedSuccess: PropTypes.bool,
};

PatchSoundcloud.defaultProps = {
  onChangeSoundCloudArr: () => {},
  soundcloud: []
};

export default PatchSoundcloud;
