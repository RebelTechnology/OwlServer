import { dispatch } from '../index';
import { formatBytes } from '../utils';

const deviceDispatchResourceReceived = ({ slot, name, size }) => {
  dispatch({
    type: 'DEVICE_RESOURCE_RECEIVED',
    slot,
    name,
    size: formatBytes(size).string,
  });
}

export default deviceDispatchResourceReceived;
