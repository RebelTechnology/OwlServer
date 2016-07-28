import {
  OWL_FIRMWARE_VERSION_RECEIVED
} from 'constants';

import { dispatch } from '../index';

const owlDispatchFirmWareVersion = (firmWare) => {
  dispatch({
    type: OWL_FIRMWARE_VERSION_RECEIVED,
    firmWare
  });
}

export default owlDispatchFirmWareVersion;