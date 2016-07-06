import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { PatchParameters } from 'components';

class PatchPreview extends Component {
  render(){
    const { patch } = this.props;
    return (
      <div className="white-box2">
        { patch.name }
        <PatchParameters patch={patch} />
      </div>
    );
  }
}

PatchPreview.propTypes = {
  patch: PropTypes.object
}

const mapStateToProps = ({ currentUser }) => {
  return { 
    currentUser
  }
}

export default connect(mapStateToProps)(PatchPreview);