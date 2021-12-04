import { owlCmd } from 'lib';
import {
  CLEAR_RESOURCE_LIST
} from 'constants';

const deleteDeviceResourceFromSlot = slot => {
  return (dispatch) => {
    dispatch({
      type: CLEAR_RESOURCE_LIST
    });

    owlCmd.deleteDeviceResourceFromSlot(slot);

    window.setTimeout(() => {
      owlCmd.requestDeviceResources();
    }, 1000);
  }
}

export default deleteDeviceResourceFromSlot;
