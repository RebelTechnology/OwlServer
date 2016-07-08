import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Parameter } from 'containers';
import { setWebAudioPatchParameter } from 'actions';

class PatchParameters extends Component {
  
  handleOnParameterChange = (parameter) => {
    this.props.setWebAudioPatchParameter(parameter);
  }

  render(){
    const { patch, patchIsActive } = this.props;
    if(!patch){
      return null;
    }

    return (
      <div className="flexbox flex-center">
      { Object.keys(patch.parameters).map((key, i) => {
        return (
          <Parameter 
            active={patchIsActive} 
            onChange={this.handleOnParameterChange} 
            key={key} 
            id={key}
            index={i}
            name={patch.parameters[key]} 
            min={0}
            max={100}
            initialValue={35}
          />
        )
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

export default connect(null, { setWebAudioPatchParameter })(PatchParameters);
