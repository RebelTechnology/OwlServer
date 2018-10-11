import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot, startPollingOwlStatus, stopPollingOwlStatus } from 'actions';

class OwlControl extends Component {

  connectToOwl(){
    if(navigator.requestMIDIAccess){
      this.props.connectToOwl();
    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  loadAndRunPatchOnDevice(){
    if(navigator.requestMIDIAccess){
      this.props.loadAndRunPatchOnDevice(this.props.patch);
    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  handleStorePatchButtonClick(){
    if(navigator.requestMIDIAccess){
    
      const slot = window.prompt('please enter a slot number to store the patch in');
    
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
    const { owlState } = this.props;
    
    return (
      <div className="owl-device-control">
        { owlState.isConnected && ( 
          <button 
            onClick={() => this.loadAndRunPatchOnDevice()}
            disabled={owlState.patchIsLoading}>
            {owlState.patchIsLoading ? 'Loading ... ' : 'Load'}
            {owlState.patchIsLoading && <i className="loading-spinner"></i> }
          </button> 
        )}

        { owlState.isConnected && ( 
          <button 
            onClick={() => this.handleStorePatchButtonClick()}
            disabled={owlState.patchIsStoring}>
            {owlState.patchIsStoring ? 'Storing ... ' : 'Store'}
            {owlState.patchIsStoring && <i className="loading-spinner"></i> }
          </button> 
        )}

        { !owlState.isConnected && (
          <button 
            onClick={() => this.connectToOwl()}
            disabled={owlState.isConnecting}>
              {owlState.isConnecting ? 'Connecting ... ' : 'Connect to OWL'}
              {owlState.isConnecting && <i className="loading-spinner"></i>}
          </button>
        )}

        <div className="owl-device-stats">
          {owlState.loadedPatchName && (<p><span>Loaded Patch:</span> {owlState.loadedPatchName}</p>)}
          {owlState.firmWareVersion && (<p><span>Connected to:</span> {owlState.firmWareVersion}</p>)}
          {owlState.status && (<p>{owlState.status}</p>)}
          {owlState.programMessage && (<p><span>Message:</span> {owlState.programMessage}</p>)}
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
  patch: PropTypes.object.isRequired
}

const mapStateToProps = ({ owlState }) => {
  return { 
    owlState
  }
}

export default connect(mapStateToProps, { connectToOwl, loadAndRunPatchOnDevice, storePatchInDeviceSlot, startPollingOwlStatus, stopPollingOwlStatus })(OwlControl);
