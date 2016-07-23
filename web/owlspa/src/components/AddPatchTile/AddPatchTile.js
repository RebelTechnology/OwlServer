import React, { Component, PropTypes } from 'react';

class AddPatchTile extends Component {
  render(){
    return (
      <a href="/add-patch/" className="patch-tile patch-tile-new">
        <div className="patch-title-controls patch-title-controls-new">
          <span className="patch-title">Add a new patch</span>
        </div>
        <div className="patch-baseline"></div>
      </a>
    );
  }
}

export default AddPatchTile;