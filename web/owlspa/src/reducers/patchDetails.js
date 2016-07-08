import { REQUEST_PATCH_DETAILS } from 'constants';
import { RECEIVE_PATCH_DETAILS } from 'constants';

const initialState = {
  isFetching: false,
  patches: {}
};

const patchDetails = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCH_DETAILS:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_PATCH_DETAILS:
      return Object.assign({}, state, {
        isFetching: false,
        patches: Object.assign({}, state.patches, {
          [action.patchDetails.seoName]:action.patchDetails
        })
      })
    default:
      return state
  }
}

export default patchDetails;