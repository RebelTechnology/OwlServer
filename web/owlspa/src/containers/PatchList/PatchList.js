import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { fetchPatches } from 'actions';
import { Patch , PatchCounter } from 'containers';

class PatchList extends Component {
  componentWillMount(){
    this.props.fetchPatches();
  }
  render(){
    const { patches } = this.props;
    return (
      <div className="wrapper flexbox">
        <div className="content-container">
          <PatchCounter />
            { patches.items.map(
              patch => {
                return (
                  <Patch 
                    key={patch._id}
                    id={patch._id}
                    name={patch.name}
                    published={patch.published}
                    authorName={patch.author.name}
                    description={patch.description}
                    tags={patch.tags}
                  />
                );
              })}
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

export default connect(mapStateToProps, {fetchPatches})(PatchList);