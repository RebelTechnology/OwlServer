import { dispatch } from '../index';

import { midi_to_param } from 'lib/availableParameterIds';

const deviceDispatchControlChange = data => {
  dispatch({
    type: 'DEVICE_CONTROL_CHANGE',
    param: midi_to_param(data),
  });
}

export default deviceDispatchControlChange;
