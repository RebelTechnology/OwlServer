import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import * as owl from 'lib/owlCmd';

import { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot } from 'actions';

import styles from './OwlControl.css';

class OwlControl extends Component {

  connectToOwl(){
    if(navigator.requestMIDIAccess){
      this.props.connectToOwl();
    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  loadAndRunPatchOnDevice(){
    if(!this.props.patch){
      alert('no patch specified');
      return;
    }

    if(navigator.requestMIDIAccess){
      this.props.loadAndRunPatchOnDevice(this.props.patch);
    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  handleStorePatchButtonClick(){
    if(!this.props.patch){
      alert('no patch specified');
      return;
    }

    if(navigator.requestMIDIAccess){

      const slot = parseInt(window.prompt('Enter a slot number from 1 to 40'));

      if (typeof slot === 'number' && slot > 0 && slot < 41)
        this.props.storePatchInDeviceSlot(this.props.patch, slot);
      else
        window.alert('slot must be a number from 1 to 40');

    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  render(){
    const { owlState, storeButton, loadButton, style } = this.props;

    const {
      firmWareVersion,
      status,
      programMessage,
      programError,
      isConnecting,
      isConnected,
      patchIsLoading,
      patchIsStoring,
      presets,
      activePresetSlot,
      uuid,
    } = owlState;

    if (!uuid && isConnected) owl.deviceUUID();

    const loadedPreset = presets.length && presets.find(preset => preset.slot === activePresetSlot);
    const loadedPatchName = !!loadedPreset && loadedPreset.name;

    return (
      <div className="owl-device-control" style={style}>
        { loadButton && isConnected && (
          <button
            onClick={() => this.loadAndRunPatchOnDevice()}
            disabled={patchIsLoading}>
            {patchIsLoading ? 'Loading ... ' : 'Load'}
            {patchIsLoading && <i className="loading-spinner"></i> }
          </button>
        )}

        { storeButton && isConnected && (
          <button
            onClick={() => this.handleStorePatchButtonClick()}
            disabled={patchIsStoring}>
            {patchIsStoring ? 'Storing ... ' : 'Store'}
            {patchIsStoring && <i className="loading-spinner"></i> }
          </button>
        )}

        { !isConnected && (
          <button
            onClick={() => this.connectToOwl()}
            disabled={isConnecting}>
              {isConnecting ? 'Connecting ... ' : 'Connect to Device'}
              {isConnecting && <i className="loading-spinner"></i>}
          </button>
        )}

        <div className="owl-device-stats">
          { loadedPatchName && (<p><span>Loaded Patch:</span> <code>{loadedPatchName}</code></p>) }
          { firmWareVersion && (<p><span>Firmware:</span> <code>{firmWareVersion}</code></p>) }
          { status && status.map((t,i) => { return (<p key={i}><span>{t[0]}:</span> <code>{t[1]}</code></p>) }) }
          { programMessage && (<p><span>{programMessage[0]}:</span> <code>{programMessage[1]}</code></p>) }
          { programError && (<p><span>Error:</span> <code>{programError}</code></p>) }
          { uuid && (<p><span>Device UUID:</span> <code>{uuid}</code></p>) }
        </div>
      </div>
    );
  }

  componentDidMount(){
    if(this.props.owlState.isConnected){
      owl.pollStatus();
    }
  }

  componentWillUnmount(){
    owl.pollStatusStop();
  }
}

OwlControl.propTypes = {
  patch: PropTypes.object,
  storeButton: PropTypes.bool,
  loadButton: PropTypes.bool,
  style: PropTypes.object
}

const mapStateToProps = ({ owlState }) => {
  return {
    owlState
  }
}

export default connect(mapStateToProps, { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot })(OwlControl);
