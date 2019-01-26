import { owlCmd } from 'lib';
import {
  CLEAR_PRESET_LIST
} from 'constants';

const resetDevice = () => {
  return (dispatch) => {
    
    dispatch({
      type: CLEAR_PRESET_LIST
    });

    owlCmd.resetDevice();

    window.setTimeout(() => {
      owlCmd.requestDevicePresets();
    }, 1000);
    
  }
}

export default resetDevice;