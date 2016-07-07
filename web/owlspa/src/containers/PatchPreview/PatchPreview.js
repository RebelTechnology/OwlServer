import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { PatchParameters, WebAudioButton } from 'components';
import { webAudio } from 'lib';
import { fetchPatchJavaScriptFile } from 'actions';

class PatchPreview extends Component {
  
  webAudioTestPatch(){
    if(webAudio.webAudioApiIsAvailable() && this.props.patch.jsAvailable){
      this.props.fetchPatchJavaScriptFile(this.props.patch);
    }

  }

  loadPatchOntoOwl(){
    console.log('load patch');
  }

  compilePatch(){
    console.log('compile');
  }
  
  render(){
    const { patch, patchJavaScript } = this.props;
    const owlIsConnected = false;
    const firmWareVerison = 'OWL Modular v12';
    const patchIsActive = true;

    console.log(patchJavaScript);

    return (
      <div className="white-box2">
        { patch.name }
        <PatchParameters patchIsActive={patchIsActive} patch={patch} />
        <div className="patch-preview-buttons">
          <button onClick={() => this.compilePatch()} >Compile Patch</button>
          <button 
            disabled={!patch.jsAvailable || !webAudio.webAudioApiIsAvailable()} 
            onClick={() => this.webAudioTestPatch()} >Test Patch in Browser
          </button>
          <button 
            disabled={!owlIsConnected} 
            onClick={() => this.loadPatchOntoOwl()} >Load Patch to Owl Device
          </button>
          
          <div className="error-msg">
            {!webAudio.webAudioApiIsAvailable() ? (
              <div>
                <p><strong>Error:</strong> Your browser does not support the HTML5 Web Audio API.</p>
                <p>consider upgrading your browser. Here's a 
                  <a target="_blank" href="http://caniuse.com/#feat=audio-api">list</a> 
                  of browsers that do support the Web Audio API.
                </p>
                </div>
            ) : null}
          </div>

          <p>Connection Status: {firmWareVerison}</p>
        </div>
      </div>
    );
  }
}

PatchPreview.propTypes = {
  patch: PropTypes.object
}

const mapStateToProps = ({ patchJavaScript }) => {
  return { 
    patchJavaScript
  }
}

export default connect(mapStateToProps, { fetchPatchJavaScriptFile })(PatchPreview);