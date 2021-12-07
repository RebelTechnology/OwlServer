import * as owl from 'lib/owlCmd';

const selectMidiOutput = (id) => {
  return (dispatch) => {

    const connectedMidiOutputPort = owl.selectMidiOutput(id);

    if(connectedMidiOutputPort){
      dispatch({
        type: 'SELECT_MIDI_OUTPUT_PORT_SUCCESS',
        connectedMidiOutputPort
      });
    }

  }
};

export default selectMidiOutput;
