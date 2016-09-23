import React, { Component, PropTypes } from 'react';

class CreatePatchTile extends Component {
  render(){
    return (
      <a href="/patch-library/create-patch" className="patch-tile patch-tile-new">
        <div className="patch-title-controls patch-title-controls-new">
          <span className="patch-title">Create patch</span>
        </div>
        <div className="patch-baseline"></div>
      </a>
    );
  }
}

export default CreatePatchTile;