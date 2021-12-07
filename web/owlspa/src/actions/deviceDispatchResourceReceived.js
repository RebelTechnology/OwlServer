import { dispatch } from '../index';

const deviceDispatchResourceReceived = ({ slot, name }) => {
  dispatch({
    type: 'DEVICE_RESOURCE_RECEIVED',
    slot,
    name
  });
}

export default deviceDispatchResourceReceived;
