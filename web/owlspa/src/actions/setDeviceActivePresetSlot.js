import { owlCmd } from 'lib';

const setDeviceActivePresetSlot = slot => {
  return (dispatch) => {
    owlCmd.setDeviceActivePresetSlot(slot);
  }
}

export default setDeviceActivePresetSlot;
