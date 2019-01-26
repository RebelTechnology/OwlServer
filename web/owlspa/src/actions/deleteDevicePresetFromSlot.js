import { owlCmd } from 'lib';
import {
  CLEAR_PRESET_LIST
} from 'constants';

const deleteDevicePresetFromSlot = slot => {
  return (dispatch) => {
    dispatch({
      type: CLEAR_PRESET_LIST
    });
    
    owlCmd.deleteDevicePresetFromSlot(slot);
    
    window.setTimeout(() => {
      owlCmd.requestDevicePresets();
    }, 1000);
  }
}

export default deleteDevicePresetFromSlot;
