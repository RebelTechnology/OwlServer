import { dispatch } from '../index';
import { formatBytes } from '../utils';

const deviceDispatchPresetReceived = ({ slot, name, size }) => {
  dispatch({
    type: 'DEVICE_PRESET_RECEIVED',
    slot,
    name,
    size: formatBytes(size).string,
  });
}

export default deviceDispatchPresetReceived;
