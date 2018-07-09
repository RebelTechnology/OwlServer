import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Parameter } from 'containers';
import { IconButton } from 'components';
import { setWebAudioPatchParameter } from 'actions';

class PatchParameters extends Component {

  handleParameterValueChange(parameter){
    this.props.setWebAudioPatchParameter(parameter);
  }


  handleParamNameChange(key, name){
    const {
      parameters
    } = this.props;

    this.props.onChangeParamNames({
      ...parameters,
      [key]: name
    });
  }

  render(){

    const { 
      patchIsActive,
      isSaving,
      editMode,
      parameters
    } = this.props;

    const renderParameters = Object.keys(parameters).map((key, i) => {
      return ( 
        <Parameter 
          active={patchIsActive} 
          onParamValueChange={(param) => this.handleParameterValueChange(param)} 
          key={key} 
          id={key}
          index={i}
          isSaving={isSaving}
          name={parameters[key]} 
          editMode={editMode}
          onParamNameChange={(key, name) => this.handleParamNameChange(key, name)}
          min={0}
          max={100}
          initialValue={35}
        />)
    });

    return (
      <div className="flexbox flex-center">
        { renderParameters }
      </div>
    );
  }

}

PatchParameters.propTypes = {
  patchIsActive: PropTypes.bool,
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool,
  onChangeParamNames: PropTypes.func,
  parameters: PropTypes.object
}

export default connect(null, { setWebAudioPatchParameter })(PatchParameters);
