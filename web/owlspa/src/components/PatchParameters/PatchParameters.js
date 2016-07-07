import React, { Component, PropTypes } from 'react';
import { Parameter } from 'containers';

class PatchParameters extends Component {

  render(){
    const { patch, patchIsActive } = this.props;
    if(!patch){
      return null;
    }
    return (
      <div className="flexbox flex-center">
      { Object.keys(patch.parameters).map(key => {
         return <Parameter active={patchIsActive} key={key} id={key} name={patch.parameters[key]} />
        })
      }
      </div>
    );
  }

}

PatchParameters.propTypes = {
  patch: PropTypes.object,
  patchIsActive: PropTypes.bool
}


export default PatchParameters;