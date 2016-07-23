import React, { Component, PropTypes } from 'react';

class PatchSoundcloud extends Component {
  getSoundcloudSrcUrl(src){
    return 'https://w.soundcloud.com/player/?url=' + 
    encodeURIComponent(src) +
    '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true'
  }
  render(){
    const { soundcloud } = this.props;

    if(!soundcloud){
      return null;
    }
    return (
      <div>
        <div class="patch-soundcloud">
          { soundcloud.map(src => <iframe width="100%" height="250" scrolling="no" frameborder="no" key={src} src={this.getSoundcloudSrcUrl(src)}></iframe>)}
        </div>
      </div>
    );
  }
}

PatchSoundcloud.propTypes = {
  soundCloud: PropTypes.array
}

export default PatchSoundcloud;