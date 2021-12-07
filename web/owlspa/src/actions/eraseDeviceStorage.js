import * as owl from 'lib/owlCmd';

const eraseDeviceStorage = () => {
  return (dispatch) => {

    dispatch({
      type: 'CLEAR_PRESET_LIST'
    });

    dispatch({
      type: 'CLEAR_RESOURCE_LIST'
    });

    owl.eraseDeviceStorage();

    window.setTimeout(() => {
      owl.requestDevicePresets();
    }, 1000);

  }
}

export default eraseDeviceStorage;
