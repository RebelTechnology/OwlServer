import { owlCmd } from 'lib';
import {
  CLEAR_PRESET_LIST
} from 'constants';

const eraseDeviceStorage = () => {
  return (dispatch) => {

    dispatch({
      type: CLEAR_PRESET_LIST
    });

    owlCmd.eraseDeviceStorage();

    window.setTimeout(() => {
      owlCmd.requestDevicePresets();
    }, 1000);

  }
}

export default eraseDeviceStorage;
