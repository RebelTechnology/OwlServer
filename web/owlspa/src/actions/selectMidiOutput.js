import {
  SELECT_MIDI_OUTPUT_PORT_SUCCESS
} from 'constants';
import { owlCmd } from 'lib';

const selectMidiOutput = (id) => {
  return (dispatch) => {

    const connectedMidiOutputPort = owlCmd.selectMidiOutput(id);

    if(connectedMidiOutputPort){
      dispatch({
        type: SELECT_MIDI_OUTPUT_PORT_SUCCESS,
        connectedMidiOutputPort
      });
    }
    
  }
};

export default selectMidiOutput;
