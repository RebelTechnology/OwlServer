import * as owl from 'lib/owlCmd';

export default function deleteDeviceResourceFromSlot(slot) {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_RESOURCE_LIST'
    });

    owl.deleteDeviceResourceFromSlot(slot);

    window.setTimeout(() => {
      owl.requestDeviceResources();
    }, 1000);
  }
}
