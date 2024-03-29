import { dispatch } from '../index';

const deviceDispatchProgramChange = slot => {
  dispatch({
    type: 'DEVICE_PROGRAM_CHANGE',
    slot
  });
}

export default deviceDispatchProgramChange;
