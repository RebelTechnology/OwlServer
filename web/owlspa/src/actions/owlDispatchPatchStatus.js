import {
  OWL_PATCH_STATUS_RECEIVED
} from 'constants';

import { dispatch } from '../index';

const owlDispatchPatchStatus = (status) => {
  dispatch({
    type: OWL_PATCH_STATUS_RECEIVED,
    status
  });
}

export default owlDispatchPatchStatus;