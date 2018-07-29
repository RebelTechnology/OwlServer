import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FloatParameter } from 'containers';
import { IconButton, BoolParameter } from 'components';
import { setWebAudioPatchParameter } from 'actions';

class PatchParameters extends Component {

  handleParamNameChange(id, name){
    const {
      parameters
    } = this.props;

    this.props.onChangeParamNames(parameters.map(parameter => {
      if(parameter.id === id){
        return {
          ...parameter,
          name
        };
      }
      return parameter;
    }));
  }

  render(){

    const { 
      patchIsActive,
      isSaving,
      editMode,
      parameters
    } = this.props;

    const floatParameters = parameters
    .filter(parameter => parameter.type === 'float')
    .map((parameter, i) => {
      return ( 
        <FloatParameter 
          active={patchIsActive} 
          onParamValueChange={ value => this.props.setWebAudioPatchParameter({id: parameter.id, value})} 
          key={i} 
          io={parameter.io}
          isSaving={isSaving}
          name={parameter.name} 
          editMode={editMode}
          onParamNameChange={name => this.handleParamNameChange(parameter.id, name)}
          min={0}
          max={100}
          initialValue={35}
        />);
    });

    const boolParameters = parameters
    .filter(parameter => parameter.type === 'bool')
    .map((parameter, i) => {
      return ( 
        <BoolParameter
          key={i}
          isActive={patchIsActive}
          io={parameter.io}
          name={parameter.name}
          editMode={editMode}
          isSaving={isSaving}
          onParamNameChange={name => this.handleParamNameChange(parameter.id, name)}
          onPushButtonDown={() => this.props.setWebAudioPatchParameter({ id: parameter.id, value: 4095 })}
          onPushButtonUp={() => this.props.setWebAudioPatchParameter({ id: parameter.id, value: 0 })} 
        />);
    });

    return (
      <div>
        <div className="flexbox flex-center">
          { floatParameters }
        </div>
        <div className="flexbox flex-center">
          { boolParameters }
        </div>
      </div>
    );
  }

}

PatchParameters.propTypes = {
  patchIsActive: PropTypes.bool,
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool,
  onChangeParamNames: PropTypes.func,
  parameters: PropTypes.array
}

export default connect(null, { setWebAudioPatchParameter })(PatchParameters);
