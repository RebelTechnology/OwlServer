import { 
  REQUEST_PATCH_DETAILS,
  RECEIVE_PATCH_DETAILS,
  EDIT_PATCH_DETAILS,
  PATCH_DELETED,
  REQUEST_COMPILE_PATCH,
  RECEIVE_COMPILE_PATCH,
  PATCH_COMPILATION_FAILED
} from 'constants';

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
    case EDIT_PATCH_DETAILS:
      return {
        ...state,
        patches: {
          ...state.patches,
          [action.patchSeoName]:{
            ...state.patches[action.patchSeoName],
            ...action.patchDetails
          }
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
    case REQUEST_COMPILE_PATCH:
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: {
            ...state.patches[action.patchSeoName],
            isCompiling: true
          }
        }
      }
    case RECEIVE_COMPILE_PATCH:
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: {
            ...state.patches[action.patchSeoName],
            isCompiling: false
          }
        }
      }
    case PATCH_COMPILATION_FAILED:
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: {
            ...state.patches[action.patchSeoName],
            isCompiling: false
          }
        }
      }
    default:
      return state
  }
}

export default patchDetails;