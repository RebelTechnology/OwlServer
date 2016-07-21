import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class Modal extends Component {
  closeModal(){
    console.log('close modal');
  }
  render(){
    const { modal } = this.props;
    // if(!modal){
    //   return null;
    // }

    return (
      <div className="modal-overlay">
        <div className="modal">
          
          <div className="modal-header">
          </div>
          
          <div className="modal-body">
          </div>
          
          <div className="modal-footer">
            <button onClick={this.closeModal}>Close</button>
          </div>
        
        </div>
      </div>
    );
  }
}

// Modal.propTypes = {
//   location: PropTypes.object.isRequired,
//   routeParams: PropTypes.object
// }

const mapStateToProps = ({ modal }) => {
  return { 
    modal
  }
}

export default connect(mapStateToProps)(Modal);