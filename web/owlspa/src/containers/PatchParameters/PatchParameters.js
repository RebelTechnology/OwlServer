import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import FloatParameter from './FloatParameter/FloatParameter';
import BoolParameter from './BoolParameter/BoolParameter';
import { setWebAudioPatchParameter } from 'actions';
import AddParameterButton from './AddParameterButton/AddParameterButton';
import availableParameterIds from './availableParameterIds';

class PatchParameters extends Component {

  handleEditedParam = (oldParam, editedParam) => {
    const {
      parameters
    } = this.props;

    this.props.onChangeParameters(parameters.map(parameter => {
      if(parameter.id === oldParam.id){
        return {
          ...parameter,
          ...editedParam
        };
      }
      return parameter;
    }));
  }

  handleDeleteParam = id => {
    const {
      parameters
    } = this.props;

    this.props.onChangeParameters(parameters.filter(param => param.id !== id));
  }

  getDisplayNameFromId = (type, fromId) => {
    const idEntry = availableParameterIds[type].filter(({ id }) => id === fromId )[0];
    return idEntry ? idEntry.displayName : undefined;
  }

  handleAddParameterclick = (options={}) => {
    const {
      type,
      availableIds
    } = options;

    if(!availableIds || (type !== 'float' && type !== 'bool')){
      window.alert('unable to add parameter');
      return;
    }

    const availableId = availableIds[0];

    if(typeof availableId === 'undefined'){
      window.alert('unable to add parameter');
      return;
    }

    const parameters = [
      ...this.props.parameters,
      {
        id: availableId.id,
        name: availableId.displayName.split('_')[1],
        io: 'input',
        type
      }
    ];

    this.props.onChangeParameters(parameters);
  }

  render(){

    const {
      stopAudio,
      patchIsActive,
      isSaving,
      editMode,
      parameters
    } = this.props;

    const floatParameters = parameters.filter(parameter => parameter.type === 'float').sort((a, b) => a.id - b.id);
    const usedFloatParameterIds = floatParameters.map(({ id }) => id);
    const availableFloatIds = availableParameterIds.float.filter(idEntry => usedFloatParameterIds.indexOf(idEntry.id) === -1)

    const boolParameters = parameters.filter(parameter => parameter.type === 'bool').sort((a, b) => a.id - b.id);
    const usedBoolParameterIds = boolParameters.map(({ id }) => id);
    const availableBoolIds = availableParameterIds.bool.filter(idEntry => usedBoolParameterIds.indexOf(idEntry.id) === -1)

    const renderFloatParameters = floatParameters.map((parameter, i) => {
      const thisIdEntry = availableParameterIds.float.filter(idEntry => idEntry.id === parameter.id);
      return (
        <FloatParameter
          active={patchIsActive}
          onParamValueChange={ value => this.props.setWebAudioPatchParameter({ ...parameter, value })}
          key={i}
          id={parameter.id}
          io={parameter.io}
          isSaving={isSaving}
          name={parameter.name}
          editMode={editMode}
          onDelete={ () => this.handleDeleteParam(parameter.id) }
          onEdit={ editedParameter => this.handleEditedParam(parameter, editedParameter) }
          availableIds={ thisIdEntry.concat(availableFloatIds) }
          min={0}
          max={100}
          initialValue={parameter.io === 'input' ? 35 : 0}
        />);
    });

    const renderBoolParameters = boolParameters.map((parameter, i) => {
      const thisIdEntry = availableParameterIds.bool.filter(idEntry => idEntry.id === parameter.id);
      return (
        <BoolParameter
          key={i}
          isActive={patchIsActive}
          io={parameter.io}
          id={parameter.id}
          name={parameter.name}
          editMode={editMode}
          isSaving={isSaving}
          onDelete={ () => this.handleDeleteParam(parameter.id) }
          onEdit={editedParameter => this.handleEditedParam(parameter, editedParameter)}
          availableIds={thisIdEntry.concat(availableBoolIds)}
          onPushButtonDown={() => this.props.setWebAudioPatchParameter({ ...parameter, value: 4095 })}
          onPushButtonUp={() => this.props.setWebAudioPatchParameter({ ...parameter, value: 0 })}
        />);
    });

    return (
      <div>
        <div className="flexbox flex-center">
          { renderFloatParameters }
          { editMode && (
            <AddParameterButton
              text="add parameter"
              onClick={ () => this.handleAddParameterclick({ type: 'float', availableIds: availableFloatIds }) }
            />
          )}
        </div>
        <div className="flexbox flex-center">
          { renderBoolParameters }
          { editMode && (
            <AddParameterButton
              text="add button"
              onClick={ () => this.handleAddParameterclick({ type: 'bool', availableIds: availableBoolIds }) }
            />
          )}
        </div>
      </div>
    );
  }

  componentWillUnmount(){
    this.props.stopAudio();
  }
}

PatchParameters.propTypes = {
  stopAudio: PropTypes.func,
  patchIsActive: PropTypes.bool,
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool,
  onChangeParameters: PropTypes.func,
  parameters: PropTypes.array
};

PatchParameters.defaultProps = {
  onChangeParameters: () => {}
};

export default connect(null, { setWebAudioPatchParameter })(PatchParameters);
