import * as owl from 'lib/owlCmd';

const selectMidiInput = (id) => {
  return (dispatch) => {

    const connectedMidiInputPort = owl.selectMidiInput(id);

    if(connectedMidiInputPort){
      dispatch({
        type: 'SELECT_MIDI_INPUT_PORT_SUCCESS',
        connectedMidiInputPort
      });
    }

  }
};

export default selectMidiInput;
