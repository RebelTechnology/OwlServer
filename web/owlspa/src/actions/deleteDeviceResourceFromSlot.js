import { owlCmd } from 'lib';

export default function deleteDeviceResourceFromSlot(slot) {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_RESOURCE_LIST'
    });

    owlCmd.deleteDeviceResourceFromSlot(slot);

    window.setTimeout(() => {
      owlCmd.requestDeviceResources();
    }, 1000);
  }
}
