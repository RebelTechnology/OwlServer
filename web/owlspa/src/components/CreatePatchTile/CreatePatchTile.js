import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class CreatePatchTile extends Component {
  render(){
    return (
      <Link to="/create-patch" className="patch-tile patch-tile-new">
        <div className="patch-title-controls patch-title-controls-new">
          <span className="patch-title">Create patch</span>
        </div>
        <div className="patch-baseline"></div>
      </Link>
    );
  }
}

export default CreatePatchTile;