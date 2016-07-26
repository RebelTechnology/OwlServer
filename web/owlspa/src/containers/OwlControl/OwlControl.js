import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { connectToOwl, loadPatchOnToOwl, startPollingOwlStatus, stopPollingOwlStatus } from 'actions';

class OwlControl extends Component {

  componentWillMount(){
    if(this.props.owlState.isConnected){
      this.props.startPollingOwlStatus();
    }
  }

  connectToOwl(){
    this.props.connectToOwl();
  }

  loadPatchOnToOwl(){
    this.props.loadPatchOnToOwl(this.props.patch);
  }

  render(){
    const { owlState } = this.props;
    
    return (
      <div className="owl-control">
        { owlState.isConnected ? ( 
          <button 
            onClick={() => this.loadPatchOnToOwl()}
            disabled={owlState.patchIsLoading}>
            {owlState.patchIsLoading ? 'Loading ... ' : 'Load'}
            {owlState.patchIsLoading ? <i className="loading-spinner"></i> : null}
          </button> ) : (
          <button 
            onClick={() => this.connectToOwl()}
            disabled={owlState.isConnecting}>
              {owlState.isConnecting ? 'Connecting ... ' : 'Connect to OWL'}
              {owlState.isConnecting ? <i className="loading-spinner"></i> : null}
          </button>)
        }
        <div className="owl-stats">
          {owlState.loadedPatchName ? (<p><span>Loaded Patch:</span> {owlState.loadedPatchName}</p>) : null}
          {owlState.firmWareVersion ? (<p><span>Connected to:</span> {owlState.firmWareVersion}</p>) : null}
          {owlState.status ? (<p>{owlState.status}</p>) : null}
          {owlState.programMessage ? (<p><span>Message:</span> {owlState.programMessage}</p>) : null}
        </div>
      </div>
    );
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
