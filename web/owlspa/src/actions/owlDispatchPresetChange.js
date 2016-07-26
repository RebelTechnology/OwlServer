import {
  OWL_PRESET_CHANGE
} from 'constants';

import { dispatch } from '../index';

const owlDispatchPresetChange = (data) => {
  dispatch({
    type: OWL_PRESET_CHANGE,
    preset : data.preset,
    name: data.name
  });
}

export default owlDispatchPresetChange;