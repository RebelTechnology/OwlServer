import { dispatch } from '../index';

const owlDispatchFirmWareVersion = (firmWare) => {
  dispatch({
    type: 'OWL_FIRMWARE_VERSION_RECEIVED',
    firmWare
  });
}

export default owlDispatchFirmWareVersion;
