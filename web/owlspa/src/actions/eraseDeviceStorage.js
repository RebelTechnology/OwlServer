import { owlCmd } from 'lib';

const eraseDeviceStorage = () => {
  return (dispatch) => {

    dispatch({
      type: 'CLEAR_PRESET_LIST'
    });

    dispatch({
      type: 'CLEAR_RESOURCE_LIST'
    });

    owlCmd.eraseDeviceStorage();

    window.setTimeout(() => {
      owlCmd.requestDevicePresets();
    }, 1000);

  }
}

export default eraseDeviceStorage;
