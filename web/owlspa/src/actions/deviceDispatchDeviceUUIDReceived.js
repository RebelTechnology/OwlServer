import { dispatch } from '../index';

const deviceDispatchDeviceUUIDReceived = uuid => {
  dispatch({
    type: 'DEVICE_UUID_RECEIVED',
    uuid
  });
}

export default deviceDispatchDeviceUUIDReceived;
