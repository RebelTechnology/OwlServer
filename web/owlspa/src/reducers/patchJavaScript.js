import { REQUEST_PATCH_JAVASCRIPT } from 'constants';
import { LOADED_PATCH_JAVASCRIPT } from 'constants';


const initialState = {
  isFetching: false,
  loadedPatch: null
};

const patchJavaScript = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCH_JAVASCRIPT:
      return {
        ...state,
        isFetching: true,
        loadedPatch: null
      }
    case LOADED_PATCH_JAVASCRIPT:
      return {
        ...state,
        isFetching: false,
        loadedPatch: action.patchId
      }
    default:
      return state
  }
}

export default patchJavaScript;