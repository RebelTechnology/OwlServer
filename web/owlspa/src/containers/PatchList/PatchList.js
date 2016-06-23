import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import Patch from '../Patch/Patch';
import PatchCounter from '../PatchCounter/PatchCounter';

class PatchList extends Component {
  render(){
    let patches = this.props.patches.map(patch => <Patch />);
    return (
      <div className="wrapper flexbox">
        <div className="content-container">
          <PatchCounter />
          {patches}
        </div>
      </div>
    );
  }
}

PatchList.PropTypes = {
  patches : PropTypes.array
};

function mapStateToProps({ patches }){
  return {
    patches
  }
}

export default connect(mapStateToProps)(PatchList);