import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { PatchParameters, OwlControl, MidiKeyboard } from 'containers';
import { webAudio } from 'lib';
import classNames from 'classnames';
import {
  fetchPatchJavaScriptFile,
  setWebAudioPatch,
  setPatchPlaying,
  resetWebAudioPatch,
} from 'actions';

class PatchPreview extends Component {
  constructor(props){
    super(props);
    this.state = {
      audioSelectValue: 'none',
      pushButtonLedColour: '#ececec',
      showMidiKeyboard: false
    };
  }

  handleTestPatchButtonClick(){
    const { patch, patch: {jsAvailable}, fetchPatchJavaScriptFile } = this.props;
    if(webAudio.webAudioApiIsAvailable() && jsAvailable){
      fetchPatchJavaScriptFile(patch);
    }
  }

  updatePushButtonLedColour(){
    if(this.props.webAudioPatch.instance){
      const pushButtonLedColour = this.props.webAudioPatch.instance.getPushButtonLedColour();
      this.setState({ pushButtonLedColour });
    }
  }

  clearPollForPushButtonLedColour(){
    if(this.pushButtonLedTimeout){
      window.clearTimeout(this.pushButtonLedTimeout);
      this.pushButtonLedTimeout = null;
    }
  }

  pollForPushButtonLedColour(){
    this.clearPollForPushButtonLedColour();
    if(this.props.webAudioPatch.isPlaying){
      this.updatePushButtonLedColour();
    }
    this.pushButtonLedTimeout = window.setTimeout(() => this.pollForPushButtonLedColour(), 500);
  }

  createPatchInstance(){
    const {
      detailsState,
    } = this.props;

    if (!detailsState.showingEmulate) return;

    const patchInstance = webAudio.initPatchAudio();

    this.props.setWebAudioPatch({
      instance: patchInstance,
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

      webAudioPatchParameters.forEach( (param, i) => {
        param.value = instance.getParameter(i) * 100;
        // instance.update(i, param.value / 100);
      });

      this.props.setPatchPlaying(true);
      this.pollForPushButtonLedColour();
    }
  }

  stopPatchAudio(){
    const { instance } = this.props.webAudioPatch;
    if(instance){
      instance.disconnectFromOutput();
      this.props.setPatchPlaying(false);
      this.clearPollForPushButtonLedColour();
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

  toggleMidiKeyboardVisibility(){
    this.setState({
      showMidiKeyboard: !this.state.showMidiKeyboard
    });
  }

  updateWebAudioPatchParameters(nextParams){
    const { webAudioPatchParameters: currentParams, webAudioPatch: {instance} } = this.props;

    if(!instance){
      return;
    }

    nextParams.forEach((nextParam, i) => {
      const existingParam = currentParams.filter(param => param.id === nextParam.id)[0];
      if(!existingParam || (existingParam.value !== nextParam.value)){
        const value = nextParam.type === 'float' ? nextParam.value / 100 : nextParam.value; // floats 0 - 1, bool 0 or 4095 ?
        console.log('[sending data to patch] parameter id:', nextParam.id, 'value:', value);
        instance.update(nextParam.id, value);
      }
    });
  }

  patchJavaScriptWillLoad(nextProps){
    const { patchJavaScript: {loadedPatch: nextLoadedPatch} } = nextProps;
    const { patchJavaScript: { loadedPatch }, patch } = this.props;
    return loadedPatch !== nextLoadedPatch && nextLoadedPatch === patch._id;
  }

  patchParametersWillChange(nextProps){
    const { webAudioPatchParameters: nextParameters } = nextProps;
    const { webAudioPatchParameters: currentParameters } = this.props;
    if(nextParameters.length !== currentParameters.length){
      return true;
    }
    return nextParameters.some((nextParam, i) => {
      const existingParam = currentParameters.filter(param => param.id === nextParam.id)[0];
      return !existingParam || (existingParam.value !== nextParam.value);
    });
  }

  patchInstanceWillBeReady(nextProps){
    const { webAudioPatch: {isReady} } = this.props;
    const { webAudioPatch: {isReady: willBeReady} } = nextProps;
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

  renderPlaySection(){
    const {
      webAudioPatch,
      patch
    } = this.props;

    const {
      audioSelectValue,
    } = this.state;

    const playAudioFile = audioSelectValue !== 'none' && audioSelectValue !== 'mic';
    const audioSampleBasePath = '/wp-content/themes/shopkeeper-child/page-patch-library/audio/';

    return (
      <div className="patch-preview-buttons">
        { !webAudioPatch.isReady && (
          <button
            disabled={!patch.jsAvailable || !webAudio.webAudioApiIsAvailable()}
            onClick={() => this.handleTestPatchButtonClick()} >
            Play
          </button>
        )}

        { webAudioPatch.isReady && (
          <button
            onClick={() => this.togglePatchAudio()} >
            { webAudioPatch.isPlaying ? 'Stop Audio' : 'Start Audio' }
          </button>
        )}

        { webAudioPatch.isPlaying && (
          <div className="audio-input-selector">
            <label htmlFor="patch-test-source">Audio Input:</label>
            <select
              id="patch-test-source"
              onChange={e => this.handleChangeAudioSource(e)}
              value={audioSelectValue} >
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
              { playAudioFile && <source src={audioSampleBasePath + audioSelectValue + '.mp3'} type="audio/mpeg" /> }
              { playAudioFile && <source src={audioSampleBasePath + audioSelectValue + '.ogg'} type="audio/ogg" /> }
            </audio>
          </div>
        )}

      </div>
    );

  }

  renderEmulateTab() {
    const {
      webAudioPatch,
      editMode,
      isSaving,
      parameters
    } = this.props;

    return (
      <div>
        <PatchParameters
          stopAudio={_ => this.stopPatchAudio()}
          patchIsActive={webAudioPatch.isPlaying}
          editMode={editMode}
          onChangeParameters={params => this.props.onChangeParameters(params)}
          isSaving={isSaving}
          parameters={parameters}
        />

        <MidiKeyboard />

        { this.renderPlaySection() }
      </div>
    )
  }

  renderDeviceTab() {
    const {
      patch,
      webAudioPatch,
      deviceIsConnected,
      editMode,
      isSaving,
      parameters,
      owlState,
    } = this.props;

    return (
      <div>
        <PatchParameters
          stopAudio={_ => this.stopPatchAudio()}
          patchIsActive={webAudioPatch.isPlaying}
          deviceIsConnected={owlState.isConnected}
          editMode={editMode}
          onChangeParameters={params => this.props.onChangeParameters(params)}
          isSaving={isSaving}
          parameters={parameters}
        />

        <MidiKeyboard />

        <OwlControl patch={patch} storeButton loadButton />
      </div>
    )
  }

  render(){

    const {
      showMidiKeyboard
    } = this.state;

    const {
      patch,
      patchJavaScript,
      webAudioPatch,
      editMode,
      isSaving,
      owlState,
      detailsState,
      parameters
    } = this.props;

    return (
      <div>
        {
          detailsState.showingAbout &&
            <PatchParameters
              stopAudio={_ => this.stopPatchAudio()}
              patchIsActive={webAudioPatch.isPlaying}
              editMode={editMode}
              onChangeParameters={params => this.props.onChangeParameters(params)}
              isSaving={isSaving}
              parameters={parameters}
            />
        }

        {
          detailsState.showingEmulate &&
            this.renderEmulateTab()
        }

        {
          detailsState.showingDevice &&
            this.renderDeviceTab()
        }

        { !webAudio.webAudioApiIsAvailable() &&
          <div className="error-msg">
            <p><strong>Error:</strong> Your browser does not support the HTML5 Web Audio API.</p>
            <p>consider upgrading your browser. Here's a
              <a target="_blank" href="http://caniuse.com/#feat=audio-api">list</a>
              of browsers that do support the Web Audio API.
            </p>
          </div>
        }
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
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool,
  parameters: PropTypes.array,
  onChangeParameters: PropTypes.func,
  onCompileClick: PropTypes.func
}

PatchPreview.defaultProps = {
  onChangeParameters: () => {},
  onCompileClick: () => {}
};

const mapStateToProps = ({ patchJavaScript, webAudioPatchParameters, webAudioPatch, owlState }) => {
  return {
    owlState,
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
