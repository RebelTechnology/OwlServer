import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { Patch , PatchCounter } from 'containers';

class PatchList extends Component {
  componentWillMount(){
    console.log('fetch me dat shit');
  }
  render(){
    const patches = this.props.patches.items.map(patch => <Patch />);
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