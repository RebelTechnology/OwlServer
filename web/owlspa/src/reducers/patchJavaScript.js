import { REQUEST_PATCH_JAVASCRIPT } from 'constants';
import { LOADED_PATCH_JAVASCRIPT } from 'constants';


const initialState = {
  isFetching: false,
  loadedPatches: []
};

const patchJavaScript = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCH_JAVASCRIPT:
      return {
        ...state,
        isFetching: true
      }
    case LOADED_PATCH_JAVASCRIPT:
      return {
        ...state,
        isFetching: false,
        loadedPatches: [
          ...state.loadedPatches,
          action.patchId
        ]
      }
    default:
      return state
  }
}

export default patchJavaScript;