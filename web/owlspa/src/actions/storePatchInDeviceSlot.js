import * as owl from 'lib/owlCmd';

import newDialog from './newDialog';

const storePatchInDeviceSlot = (patch, slot) => {
  return (dispatch) => {
    owl.pollStatusStop();

    dispatch({
      type: 'STORE_PATCH_ON_DEVICE_REQUEST'
    });

    return owl.storePatchInDeviceSlot(patch._id, slot).then(() => {

      dispatch({
        type: 'STORE_PATCH_ON_DEVICE_SUCCESS'
      });

      owl.pollStatus();

    }).catch(err => {

      dispatch({
        type: 'STORE_PATCH_ON_DEVICE_ERROR'
      });

      console.error(err);

      dispatch(newDialog({
        header: 'Failed to store patch device',
        isError : true,
        tabs:[{
          header :'Error',
          isError: true,
          contents: 'Failed to store the patch on the device'
        }]
      }));

      owl.pollStatus();

    });
  }
}

export default storePatchInDeviceSlot;
