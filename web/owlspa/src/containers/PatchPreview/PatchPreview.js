import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { PatchParameters, OwlControl } from 'containers';
import { webAudio } from 'lib';
import classNames from 'classnames';
import { 
  fetchPatchJavaScriptFile,
  setWebAudioPatch,
  setPatchPlaying,
  resetWebAudioPatch } from 'actions';

class PatchPreview extends Component {
  constructor(props){
    super(props);
    this.state = {
      audioSelectValue : 'none',
      pushButtonLedColour : null
    };
  }
  
  handleTestPatchButtonClick(){
    const { patch, patch:{jsAvailable}, fetchPatchJavaScriptFile } = this.props;
    if(webAudio.webAudioApiIsAvailable() && jsAvailable){
      fetchPatchJavaScriptFile(patch);
    }
  }

  handlePushButtonDown(e){
    this.props.webAudioPatch.instance.setPushButtonDown();
    this.getWebAudioPatchPushButtonLedColour();
  }

  handlePushButtonUp(e){
    this.props.webAudioPatch.instance.setPushButtonUp();
    this.getWebAudioPatchPushButtonLedColour();
  }

  getWebAudioPatchPushButtonLedColour(options){
    options = options || {};
    const { webAudioPatch } = this.props
    if(webAudioPatch.instance){
      const pushButtonLedColour = webAudioPatch.instance.getPushButtonLedColour();
      if(this.state.pushButtonLedColour !== pushButtonLedColour){
        this.setState({ pushButtonLedColour });
      }
    }
    if(options.poll){
      this.pushButtonLedTimeout = () => this.getWebAudioPatchPushButtonLedColour({poll:true});
      window.setTimeout(this.pushButtonLedTimeout, 500);
    }
  }

  createPatchInstance(){
    const patchInstance = webAudio.initPatchAudio();

    this.props.setWebAudioPatch({
      instance : patchInstance,
      isReady: true
    });
  }

  initAudioDomNode(audioNode){
    this.audioNode = audioNode;
  }

  handleChangeAudioSource(e){
    const audioSelectValue = e.target.value;
    this.setState({audioSelectValue});    

    if(audioSelectValue === 'none'){
      this.props.webAudioPatch.instance.clearInput();
      return;
    }

    if(audioSelectValue === 'mic'){
      this.props.webAudioPatch.instance.useMicrophoneInput();
      return;
    }

    this.audioNode.load();
    this.audioNode.play();
    this.props.webAudioPatch.instance.useFileInput(this.audioNode);
  }

  startPatchAudio(instance){
    const { webAudioPatch, webAudioPatchParameters, patch } = this.props;
    instance = instance || webAudioPatch.instance;
    if(instance){
      instance.connectToOutput({outputs: patch.outputs});
      
      webAudioPatchParameters.forEach((param,i)=>{
        instance.update(i, param.value/100);
      });

      this.props.setPatchPlaying(true);
      this.getWebAudioPatchPushButtonLedColour({poll:true});
    }
  }

  stopPatchAudio(){
    const { instance } = this.props.webAudioPatch;
    if(instance){
      instance.disconnectFromOutput();
      window.clearTimeout(this.pushButtonLedTimeout);
      this.props.setPatchPlaying(false);
    }
  }

  togglePatchAudio(){
    const { isPlaying } = this.props.webAudioPatch;
    if(isPlaying){
      this.stopPatchAudio();
    } else {
      this.startPatchAudio();
    }
  }

  updateWebAudioPatchParameters(nextParams){
    const { webAudioPatchParameters:currentParams, webAudioPatch:{instance} } = this.props;
    nextParams.forEach((nextParam, i) => {
      if(nextParam.value !== currentParams[i].value){
        if(instance){
          instance.update(i, nextParam.value/100);
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

  patchInstanceWillBeReady(nextProps){
    const { webAudioPatch:{isReady} } = this.props;
    const { webAudioPatch:{isReady:willBeReady} } = nextProps;
    return !isReady && willBeReady;
  }
  
  componentWillReceiveProps(nextProps){
    if(this.patchJavaScriptWillLoad(nextProps)){
      this.createPatchInstance();
    }

    if(this.patchInstanceWillBeReady(nextProps)){
      this.startPatchAudio(nextProps.webAudioPatch.instance);
    }

    if(this.patchParametersWillChange(nextProps)){
      this.updateWebAudioPatchParameters(nextProps.webAudioPatchParameters);
    }
  }

  render(){
    const { patch, patchJavaScript, webAudioPatch, canEdit } = this.props;
    const { audioSelectValue } = this.state;
    const audioSampleBasePath = '/wp-content/themes/hoxton-owl-2014/page-patch-library/audio/';
    const playAudioFile = audioSelectValue !== 'none' && audioSelectValue !== 'mic';

    return (
      <div className="white-box2">
        <PatchParameters 
          patchIsActive={webAudioPatch.isPlaying} 
          patch={patch} 
        />

        <div 
          className={classNames('patch-push-button', {active:webAudioPatch.isPlaying})}
          onMouseDown={(e) => webAudioPatch.isPlaying && this.handlePushButtonDown(e) }
          onMouseUp={(e) => webAudioPatch.isPlaying && this.handlePushButtonUp(e) }
          onTouchStart={(e) => webAudioPatch.isPlaying && this.handlePushButtonDown(e) }
          onTouchEnd={(e) => webAudioPatch.isPlaying && this.handlePushButtonUp(e) }>
          <div 
            style={
              {backgroundColor: (webAudioPatch.isPlaying && this.state.pushButtonLedColour) ? this.state.pushButtonLedColour : '#ececec'}
            } 
            className="patch-push-button-led">
          </div>
          <label>Pushbutton</label>
        </div>

        <div className="patch-preview-buttons">
          
          { canEdit ? (
            <button 
              disabled={patch.isCompiling} 
              className={classNames('patch-compile-button',{isCompiling: patch.isCompiling})}
              onClick={(e) => this.props.onCompileClick(e)} >
              {patch.isCompiling ? 'Compiling . . .': 'Compile Patch'}
              {patch.isCompiling ? <i className="loading-spinner"></i> : null}
            </button>
            ) : null
          }

          { webAudioPatch.isReady ? (
              <button
                onClick={() => this.togglePatchAudio()} >
                { webAudioPatch.isPlaying ? 'stop audio':'start audio' }
              </button>
            ) : (
              <button 
                disabled={!patch.jsAvailable || !webAudio.webAudioApiIsAvailable() } 
                onClick={() => this.handleTestPatchButtonClick()} >Test Patch in Browser
              </button>
            )
          }

          { webAudioPatch.isPlaying ? (
            <div id="patch-test-inner-container">
              <label for="patch-test-source">Audio Input:</label>
              <select 
                id="patch-test-source" 
                onChange={e => this.handleChangeAudioSource(e)}
                value={this.state.audioSelectValue} >
                <option value="none">No Input</option>
                <option value="mic">Microphone</option>
                <option disabled>──────────</option>
                <option value="gtr-jazz">Jazz Guitar</option>
                <option value="rock-beat">Rock Beat</option>
                <option value="synth">Synth</option>
                <option value="white-noise">White Noise</option>
              </select>

              <audio 
                id="patch-test-audio" 
                controls 
                loop 
                preload="auto"
                ref={(node) => this.initAudioDomNode(node)}>
                {playAudioFile ? (
                  <source src={audioSampleBasePath + this.state.audioSelectValue + '.mp3'} type="audio/mpeg" />
                ):null }
                {playAudioFile ? (
                  <source src={audioSampleBasePath + this.state.audioSelectValue + '.ogg'} type="audio/ogg" />
                ):null }
              </audio>
            </div>
          ) : null }
          
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

          <OwlControl />

        </div>
      </div>
    );
  }

  componentWillUnmount(){
    this.stopPatchAudio();
    this.props.resetWebAudioPatch();
  }
}

PatchPreview.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool,
  onCompileClick: PropTypes.func
}

const mapStateToProps = ({ patchJavaScript, webAudioPatchParameters, webAudioPatch }) => {
  return { 
    patchJavaScript,
    webAudioPatchParameters,
    webAudioPatch
  }
}

export default connect(mapStateToProps, { 
  fetchPatchJavaScriptFile, 
  setWebAudioPatch,
  setPatchPlaying,
  resetWebAudioPatch
})(PatchPreview);
