const initialState = {
  isFetching: false,
  loadedPatch: null
};

const patchJavaScript = (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_PATCH_JAVASCRIPT':
      return {
        ...state,
        isFetching: true,
        loadedPatch: null
      }
    case 'LOADED_PATCH_JAVASCRIPT':
      return {
        ...state,
        isFetching: false,
        loadedPatch: action.patchId
      }
    case 'RESET_PATCH_JAVASCRIPT':
      return initialState;

    case 'RESET_WEB_AUDIO_PATCH':
      return initialState;

    default:
      return state;
  }
}

export default patchJavaScript;
