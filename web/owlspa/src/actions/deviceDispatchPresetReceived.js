import {
  DEVICE_PRESET_RECEIVED
} from 'constants';

import { dispatch } from '../index';

const deviceDispatchPresetReceived = ({ slot, name }) => {
  dispatch({
    type: DEVICE_PRESET_RECEIVED,
    slot,
    name
  });
}

export default deviceDispatchPresetReceived;
