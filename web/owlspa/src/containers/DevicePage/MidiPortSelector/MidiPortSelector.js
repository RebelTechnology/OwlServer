import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectMidiInput, selectMidiOutput } from 'actions';

class MidiPortSelector extends Component {

  render(){
    const {
      isConnected,
      midiInputs,
      midiOutputs,
      connectedMidiInputPort={},
      connectedMidiOutputPort={}
    } = this.props;

    if(!isConnected){
      return null;
    }

    return (
      <div>
        <label>
          Midi Input:
          { midiInputs && midiInputs.length ? (
            <select onChange={e => this.props.selectMidiInput( e.target.value )} value={connectedMidiInputPort.id}>
              { midiInputs.map((input, i) => <option key={i} value={input.id}>{input.name}</option>) }
            </select>
          ) : 'No Midi Inputs available' }
        </label>
        <label>
          Midi Output:
          { midiOutputs && midiOutputs.length ? (
            <select onChange={e => this.props.selectMidiOutput( e.target.value )} value={connectedMidiOutputPort.id}>
              { midiOutputs.map((output, i) => <option key={i} value={output.id}>{output.name}</option>) }
            </select>
          ) : 'No Midi Outputs available' }
        </label>
      </div>
    );
  }

}

const mapStateToProps = ({ 
  owlState: { 
    isConnected,
    midiInputs,
    midiOutputs,
    connectedMidiInputPort,
    connectedMidiOutputPort
  } 
}) => {
  
  return { 
    isConnected,
    midiInputs,
    midiOutputs,
    connectedMidiInputPort,
    connectedMidiOutputPort
  }
}

export default connect(mapStateToProps, { selectMidiInput, selectMidiOutput })(MidiPortSelector);
