import { owlCmd } from 'lib';

import newDialog from './newDialog';

const storePatchInDeviceSlot = (patch, slot) => {
  return (dispatch) => {
    owlCmd.stopPollingOwlStatus();
    dispatch({
      type: 'STORE_PATCH_ON_DEVICE_REQUEST'
    });

    return owlCmd.storePatchInDeviceSlot(patch._id, slot).then(() => {

      dispatch({
        type: 'STORE_PATCH_ON_DEVICE_SUCCESS'
      });

      owlCmd.startPollingOwlStatus();

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

      owlCmd.startPollingOwlStatus();

    });
  }
}

export default storePatchInDeviceSlot;
