import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { PatchParameters, WebAudioButton } from 'components';
import { webAudio } from 'lib';
import { fetchPatchJavaScriptFile, setWebAudioPatchInstance } from 'actions';

class PatchPreview extends Component {
  constructor(props){
    super(props);
    this.state = {
      audioSelectValue : 'none'
    };
  }
  
  handleTestPatchButtonClick(){
    const { patch, patch:{jsAvailable}, fetchPatchJavaScriptFile } = this.props;
    if(webAudio.webAudioApiIsAvailable() && jsAvailable){
      fetchPatchJavaScriptFile(patch);
    }
  }

  startPatchAudio(){
    const patchInstance = webAudio.initPatchAudio();
    patchInstance.connectToOutput({outputs: this.props.patch.outputs});
    
    this.props.webAudioPatchParameters.forEach((param,i)=>{
      patchInstance.update(i, param.value/100);
    });

    this.props.setWebAudioPatchInstance(patchInstance);
  }

  handleChangeAudioSource(e){
    this.setState({audioSelectValue: e.target.value});
    console.log('audio source changed!', e.target.value);
    // var $target = $(e.target);
    // var $audio = $('#patch-test-audio');
    // var val = $(e.target).val();
    // var audioSampleBasePath = '/wp-content/themes/hoxton-owl-2014/page-patch-library/audio/';
    // $audio.find('source').remove();
    // if ('_' !== val.substr(0, 1)) {
    //     var html = '<source src="' + audioSampleBasePath + val + '.mp3" type="audio/mpeg"><source src="' + audioSampleBasePath + val + '.ogg" type="audio/ogg">';
    //     $(html).appendTo($audio);
    // }
    // $audio[0].load();
  }

  loadPatchOntoOwl(){
    console.log('load patch');
  }

  compilePatch(){
    console.log('compile');
  }

  updateWebAudioPatchParameters(nextParams){
    const { webAudioPatchParameters:currentParams, webAudioPatchInstance:{patchInstance} } = this.props;
    nextParams.forEach((nextParam, i) => {
      if(nextParam.value !== currentParams[i].value){
        if(patchInstance){
          patchInstance.update(i, nextParam.value/100);
        }
      }
    });
  }

  patchJavaScriptWillLoad(nextProps){
    const { patchJavaScript:{loadedPatch:nextLoadedPatch} } = nextProps;
    const { patchJavaScript:{ loadedPatch }, patch } = this.props;
    return loadedPatch !== nextLoadedPatch && nextLoadedPatch === patch._id;
  }

  patchParametersWillChange(nextProps){
    const { webAudioPatchParameters:nextParameters } = nextProps;
    const { webAudioPatchParameters:currentParameters } = this.props;
    if(!nextParameters.length || !currentParameters.length){
      return false;
    }
    return nextParameters.some((nextParam, i) => {
      return currentParameters[i].value !== nextParam.value
    });
  }
  
  componentWillReceiveProps(nextProps){
    if(this.patchJavaScriptWillLoad(nextProps)){
      this.startPatchAudio();
    }

    if(this.patchParametersWillChange(nextProps)){
      this.updateWebAudioPatchParameters(nextProps.webAudioPatchParameters);
    }
  }
  
  render(){
    const { patch, patchJavaScript, webAudioPatchInstance:{patchInstance} } = this.props;
    const owlIsConnected = false;
    const firmWareVerison = 'OWL Modular v12';
    const patchIsActive = !!patchInstance;
    const audioSampleBasePath = '/wp-content/themes/hoxton-owl-2014/page-patch-library/audio/';

    return (
      <div className="white-box2">
        { patch.name }
        <PatchParameters 
          patchIsActive={patchIsActive} 
          patch={patch} 
        />
        <div className="patch-preview-buttons">
          <button onClick={() => this.compilePatch()} >Compile Patch</button>
          <button 
            disabled={!patch.jsAvailable || !webAudio.webAudioApiIsAvailable() } 
            onClick={() => this.handleTestPatchButtonClick()} >Test Patch in Browser
          </button>
          <button 
            disabled={!owlIsConnected} 
            onClick={() => this.loadPatchOntoOwl()} >Load Patch to Owl Device
          </button>


          <div id="patch-test-inner-container">

            <input type="button" value="Pushbutton" id="patch-test-pushbutton" />
            <br/>
            <label for="patch-test-source">Source:</label>

            <select 
              id="patch-test-source" 
              onChange={e => this.handleChangeAudioSource(e)}
              value={this.state.audioSelectValue} >
              <option value="none">No Input</option>
              <option value="_mic">Microphone</option>
              <option disabled>──────────</option>
              <option value="gtr-jazz">Jazz Guitar</option>
              <option value="rock-beat">Rock Beat</option>
              <option value="synth">Synth</option>
              <option value="white-noise">White Noise</option>
            </select>

            <input type="button" value="Start" id="patch-test-start-stop" />

            <audio id="patch-test-audio" controls loop preload="auto">
              {this.state.audioSelectValue !== 'none' ? (
                <source src={audioSampleBasePath + this.state.audioSelectValue + '.mp3'} type="audio/mpeg" />
              ):null }
              {this.state.audioSelectValue !== 'none' ? (
                <source src={audioSampleBasePath + this.state.audioSelectValue + '.ogg'} type="audio/ogg" />
              ):null }
            </audio>
          </div>
          
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
  componentWillUnMount(){
    this.props.setWebAudioPatchInstance(null);
  }
}

PatchPreview.propTypes = {
  patch: PropTypes.object
}

const mapStateToProps = ({ patchJavaScript, webAudioPatchParameters, webAudioPatchInstance }) => {
  return { 
    patchJavaScript,
    webAudioPatchParameters,
    webAudioPatchInstance
  }
}

export default connect(mapStateToProps, { fetchPatchJavaScriptFile, setWebAudioPatchInstance })(PatchPreview);
