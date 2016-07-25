import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { connectToOwl, loadPatchOnToOwl } from 'actions';

class OwlControl extends Component {

  connectToOwl(){
    this.props.connectToOwl();
  }

  loadPatchOnToOwl(){
    this.props.loadPatchOnToOwl(this.props.patch);
  }

  render(){
    const { owlState } = this.props;

    const firmWareVerison = 'OWL Modular v12'; //TODO getfrom device
    
    return (
      <div>
        { owlState.isConnected ? ( 
          <button 
            onClick={() => this.loadPatchOnToOwl()}
            disabled={owlState.patchIsLoading}>
            {owlState.patchIsLoading ? 'Loading ... ' : 'Load to Owl'}
            {owlState.patchIsLoading ? <i className="loading-spinner"></i> : null}
          </button> 
          ) : (
            <button 
              onClick={() => this.connectToOwl()}
              disabled={owlState.isConnecting}>
                {owlState.isConnecting ? 'Connecting ... ' : 'Connect to Owl'}
                {owlState.isConnecting ? <i className="loading-spinner"></i> : null}
            </button>
          ) }

        <p>Connection Status: {firmWareVerison}</p>
      </div>
    );
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

export default connect(mapStateToProps, { connectToOwl, loadPatchOnToOwl })(OwlControl);