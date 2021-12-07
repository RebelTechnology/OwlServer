import * as owl from 'lib/owlCmd';

const resetDevice = () => {
  return (dispatch) => {

    dispatch({
      type: 'CLEAR_PRESET_LIST'
    });

    owl.resetDevice();

    window.setTimeout(() => {
      owl.requestDevicePresets();
    }, 1000);

  }
}

export default resetDevice;
