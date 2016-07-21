import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { owlCmd } from 'lib';

class OwlControl extends Component {

  loadPatchOntoOwl(){
    console.log('load patch to owl');
  }

  render(){
    //const { currentUser } = this.props;

    const owlIsConnected = false; //TODO get from device
    const firmWareVerison = 'OWL Modular v12'; //TODO getfrom device
    
    return (
      <div>
        <p>Owl Control</p>
        <button 
          disabled={!owlIsConnected} 
          onClick={() => this.loadPatchOntoOwl()} >Load Patch to Owl Device
        </button>
        <p>Connection Status: {firmWareVerison}</p>
      </div>
    );
  }
}

// OwlControl.propTypes = {
//   location: PropTypes.object.isRequired,
//   routeParams: PropTypes.object
// }

const mapStateToProps = ({ currentUser }) => {
  return { 
    currentUser
  }
}

export default connect(mapStateToProps)(OwlControl);