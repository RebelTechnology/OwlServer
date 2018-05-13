import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Parameter } from 'containers';
import { IconButton } from 'components';
import { setWebAudioPatchParameter } from 'actions';

class PatchParameters extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      editMode: false,
      parameters: props.patch && props.patch.parameters || {}
    }
  }

  handleParameterValueChange(parameter){
    this.props.setWebAudioPatchParameter(parameter);
  }

  handleEditClick(){
    this.setState({
      editMode: true
    });
  }

  handleSaveClick(){
    this.props.onSaveParamNames(this.state.parameters)
  }

  handleParamNameChange(key, name){
    const {
      parameters
    } = this.state;

    this.setState({
      parameters: {
        ...parameters,
        [key]: name
      }
    })
  }

  parameterNamesHaveChanged(nextProps){
    const {
      patch
    } = this.props;

    if(patch !== nextProps.patch){
      return true;
    }

    if(patch.parameters !== nextProps.patch.parameters){
      return true;
    }

    return Object.keys(nextProps.patch.parameters).some(paramKey => {
      return nextProps.patch.parameters[paramKey] !== patch.parameters[paramKey]
    });

  }

  componentWillReceiveProps(nextProps){
    
    if(!nextProps.isSaving && this.props.isSaving){
      this.setState({
        editMode: false
      });
    }

    if(this.parameterNamesHaveChanged(nextProps)){
      this.setState({
        parameters: nextProps.patch && nextProps.patch.parameters || {}
      });
    }
  }

  render(){

    const { 
      patch,
      patchIsActive,
      isSaving,
      canEdit
    } = this.props;

    const {
      editMode,
      parameters
    } = this.state;

    if(!patch){
      return null;
    }

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
        { canEdit && !editMode && <IconButton title="edit parameter names" icon={ isSaving ? 'loading' : 'edit' } disabled={isSaving} onClick={ e => this.handleEditClick(e) } /> }
        { canEdit && editMode && <IconButton title="save" icon={ isSaving ? 'loading' : 'save' } disabled={isSaving} onClick={  e => this.handleSaveClick(e) } /> }
      </div>
    );
  }

}

PatchParameters.propTypes = {
  patch: PropTypes.object,
  patchIsActive: PropTypes.bool,
  canEdit: PropTypes.bool,
  isSaving: PropTypes.bool,
  onSaveParamNames: PropTypes.func
}

export default connect(null, { setWebAudioPatchParameter })(PatchParameters);
