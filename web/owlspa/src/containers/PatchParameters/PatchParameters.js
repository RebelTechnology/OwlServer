import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as owl from 'lib/owlCmd';
import FloatParameter from './FloatParameter/FloatParameter';
import BoolParameter from './BoolParameter/BoolParameter';
import { setWebAudioPatchParameter, setMIDIPatchParameter } from 'actions';
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

  sendValue(parameter, value) {
    if (this.props.deviceIsConnected) {
      this.props.setMIDIPatchParameter({ ...parameter, value });
      owl.setParameter(parameter);
    }
    else if (this.props.patchIsActive)
      this.props.setWebAudioPatchParameter({ ...parameter, value });
  }

  consumeParam(p) {
    let r = null;

    if (this.props.param && this.props.param.id === p.id) {
      r = Object.assign({}, this.props.param)

      this.props.param.id = null;
      this.props.param.value = null;
    }

    return r;
  }

  render(){

    const {
      stopAudio,
      patchIsActive,
      deviceIsConnected,
      isSaving,
      editMode,
      parameters,
    } = this.props;

    const availableFloatIds = availableParameterIds.float.filter(e => parameters.find(p => p.type === 'float' && p.id !== e.id));
    const availableBoolIds = availableParameterIds.bool.filter(e => parameters.find(p => p.type === 'bool' && p.id !== e.id));

    if (this.props.param) {
      const p = parameters.find(x => x.id === this.props.param.id);
      if (p) p.value = this.props.param.value;
    }

    const renderFloatParameters = parameters
      .filter(p => p.type === 'float')
      .sort((a,b) => a.id - b.id)
      .map((p,i) => {
        const available_ids = availableFloatIds.concat([availableParameterIds.float.find(x => x.id === p.id)]);

        return (
          <FloatParameter
            active={patchIsActive || deviceIsConnected}
            onParamValueChange={ v => this.sendValue({ ...p, value: (p.value || v) })}
            key={i}
            id={p.id}
            io={p.io}
            isSaving={isSaving}
            name={p.name}
            editMode={editMode}
            onDelete={ () => this.handleDeleteParam(p.id) }
            onEdit={ e => this.handleEditedParam(p,e) }
            availableIds={available_ids}
            min={0}
            max={100}
            param={this.consumeParam(p)}
          />);
      });

    const renderBoolParameters = parameters
      .filter(p => p.type === 'bool')
      .sort((a,b) => a.id - b.id)
      .map((p,i) => {
        const available_ids = availableBoolIds.concat([availableParameterIds.bool.find(x => x.id === p.id)]);

        return (
          <BoolParameter
            key={i}
            isActive={patchIsActive || deviceIsConnected || p.value > 0}
            io={p.io}
            id={p.id}
            name={p.name}
            editMode={editMode}
            isSaving={isSaving}
            onDelete={ () => this.handleDeleteParam(p.id) }
            onEdit={ e => this.handleEditedParam(p,e) }
            availableIds={available_ids}
            onPushButtonDown={() => this.sendValue({ ...p, value: 4095, press: 1 })}
            onPushButtonUp={() => this.sendValue({ ...p, value: 0, press: 0 })}
            param={this.consumeParam(p)}
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

const mapStateToProps = ({ owlState: { param } }) => {
  return {
    param
  }
};

export default connect(mapStateToProps, { setWebAudioPatchParameter, setMIDIPatchParameter })(PatchParameters);
