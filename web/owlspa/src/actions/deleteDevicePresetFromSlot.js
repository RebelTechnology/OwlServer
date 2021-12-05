import { owlCmd } from 'lib';

const deleteDevicePresetFromSlot = slot => {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_PRESET_LIST'
    });

    owlCmd.deleteDevicePresetFromSlot(slot);

    window.setTimeout(() => {
      owlCmd.requestDevicePresets();
    }, 1000);
  }
}

export default deleteDevicePresetFromSlot;
