import { owlCmd } from 'lib';

const selectMidiInput = (id) => {
  return (dispatch) => {

    const connectedMidiInputPort = owlCmd.selectMidiInput(id);

    if(connectedMidiInputPort){
      dispatch({
        type: 'SELECT_MIDI_INPUT_PORT_SUCCESS',
        connectedMidiInputPort
      });
    }

  }
};

export default selectMidiInput;
