const initialState = {};

const updateSourceFileCode = (state = [], index, data = {}) => {
  let newState = [...state];
  newState[index] = {
    ...newState[index],
    ...data
  }
  return newState;
};

const patchSourceCodeFiles = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PATCH_SOURCE_FILE_SUCCESS':
      return {
        ...state,
        [action.patchId]: updateSourceFileCode(state[action.patchId], action.index, {
          fileString: action.fileString,
          fileUrl: action.fileUrl,
          edited: false,
          isLoading: false,
          errorFetching: null
        })
      }

    case 'FETCH_PATCH_SOURCE_FILE_REQUEST':
      return {
        ...state,
        [action.patchId]: updateSourceFileCode(state[action.patchId], action.index, {
          isLoading: true
        })
      }

    case 'FETCH_PATCH_SOURCE_FILE_ERROR':
      return {
        ...state,
        [action.patchId]: updateSourceFileCode(state[action.patchId], action.index, {
          isLoading: false,
          errorFetching: action.reason
        })
      }

    case 'UPDATE_PATCH_SOURCE_FILE':
      return {
        ...state,
        [action.patchId]: updateSourceFileCode(state[action.patchId], action.index, {
          fileString: action.fileString,
          edited: true
        })
      }

    case 'SAVE_PATCH_SOURCE_FILES_REQUEST':
      return {
        ...state,
        [action.patchId]: state[action.patchId].map(file => {
          return {
            ...file,
            isSaving: true
          }
        })
      }

    case 'SAVE_PATCH_SOURCE_FILES_SUCCESS':
      return {
        ...state,
        [action.patchId]: state[action.patchId].map(file => {
          return {
            ...file,
            isSaving: false,
            edited: false
          }
        })
      }

    case 'SAVE_PATCH_SOURCE_FILES_ERROR':
      return {
        ...state,
        [action.patchId]: state[action.patchId].map(file => {
          return {
            ...file,
            isSaving: false
          }
        })
      }

    case 'CLEAR_PATCH_SOURCE_CODE_FILES':
      return {
        ...state,
        [action.patchId]: []
      }

    default:
      return state;
  }
}

export default patchSourceCodeFiles;
