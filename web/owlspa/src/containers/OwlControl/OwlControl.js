import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot, startPollingOwlStatus, stopPollingOwlStatus, showDeviceUUID } from 'actions';

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

      const slot = parseInt(window.prompt('Enter a slot number from 0 to 40'));

      if(typeof slot !== 'number' || slot < 0 || slot > 40){
        window.alert('slot must be a number between 0 and 40 inclusive');
        return;
      }

      this.props.storePatchInDeviceSlot(this.props.patch, slot);

    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  render(){
    const { owlState, storeButton, loadButton, style, showDeviceUUID } = this.props;

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
      activePresetSlot
      uuid,
    } = owlState;


    if (!uuid) this.props.showDeviceUUID();

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
          {loadedPatchName && (<p><span>Loaded Patch:</span> {loadedPatchName}</p>)}
          {firmWareVersion && (<p><span>Connected to:</span> {firmWareVersion}</p>)}
          {status && (<p>{status}</p>)}
          {programMessage && (<p><span>Message:</span> {programMessage}</p>)}
          {programError && (<p><span>Error:</span> {programError}</p>)}
          { uuid && (<p><span>Device UUID:</span> <code>{uuid}</code></p>) }
        </div>
      </div>
    );
  }

  componentDidMount(){
    if(this.props.owlState.isConnected){
      this.props.startPollingOwlStatus();
    }
  }

  componentWillUnmount(){
    this.props.stopPollingOwlStatus();
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

export default connect(mapStateToProps, { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot, startPollingOwlStatus, stopPollingOwlStatus, showDeviceUUID })(OwlControl);
