import { REQUEST_PATCH_DETAILS, RECEIVE_PATCH_DETAILS, PATCH_DELETED } from 'constants';

const initialState = {
  isFetching: false,
  patches: {}
};

const patchDetails = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCH_DETAILS:
      return {
        ...state,
        isFetching: true
      }
    case RECEIVE_PATCH_DETAILS:
      return {
        ...state,
        isFetching: false,
        patches: {
          ...state.patches,
          [action.patchDetails.seoName]:action.patchDetails
        }
      }
    case PATCH_DELETED:
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: null
        }
      }
    default:
      return state
  }
}

export default patchDetails;