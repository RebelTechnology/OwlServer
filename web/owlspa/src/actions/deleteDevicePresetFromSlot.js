import * as owl from 'lib/owlCmd';

const deleteDevicePresetFromSlot = slot => {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_PRESET_LIST'
    });

    owl.deleteDevicePresetFromSlot(slot);

    window.setTimeout(() => {
      owl.requestDevicePresets();
    }, 1000);
  }
}

export default deleteDevicePresetFromSlot;
