import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { connectToOwl, loadPatchOnToOwl, startPollingOwlStatus, stopPollingOwlStatus } from 'actions';

class OwlControl extends Component {

  connectToOwl(){
    if(navigator.requestMIDIAccess){
      this.props.connectToOwl();
    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  loadPatchOnToOwl(){
    if(navigator.requestMIDIAccess){
      this.props.loadPatchOnToOwl(this.props.patch);
    } else {
      window.alert('Please use a Web MIDI enabled browser (e.g. Chrome) to connect to your OWL');
    }
  }

  render(){
    const { owlState } = this.props;
    
    return (
      <div className="owl-device-control">
        { owlState.isConnected ? ( 
          <button 
            onClick={() => this.loadPatchOnToOwl()}
            disabled={owlState.patchIsLoading}>
            {owlState.patchIsLoading ? 'Loading ... ' : 'Load'}
            {owlState.patchIsLoading && <i className="loading-spinner"></i> }
          </button> ) : (
          <button 
            onClick={() => this.connectToOwl()}
            disabled={owlState.isConnecting}>
              {owlState.isConnecting ? 'Connecting ... ' : 'Connect to OWL'}
              {owlState.isConnecting && <i className="loading-spinner"></i>}
          </button>)
        }
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

export default connect(mapStateToProps, { connectToOwl, loadPatchOnToOwl, startPollingOwlStatus, stopPollingOwlStatus })(OwlControl);
