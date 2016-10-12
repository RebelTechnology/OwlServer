import {
  REQUEST_PATCH_CODE_FILE,
  RECEIVE_PATCH_CODE_FILE,
  REQUEST_PATCH_CODE_FILE_FAILED,
  UPDATE_PATCH_CODE_FILE,
  SERVER_SAVE_PATCH_CODE_FILES,
  SERVER_SAVE_PATCH_CODE_FILES_SUCCESS,
  SERVER_SAVE_PATCH_CODE_FILES_FAIL
} from 'constants';

const initialState = {};

const updateCodeFile = (state = [], index, data = {}) => {
  let newState = [...state];
  newState[index] = {
    ...newState[index],
    ...data
  }
  return newState;
};

const patchCodeFiles = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PATCH_CODE_FILE:
      return {
        ...state,
        [action.patchId]: updateCodeFile(state[action.patchId], action.index, {
          fileString: action.fileString,
          fileUrl: action.fileUrl,
          edited: false,
          isLoading: false,
          errorFetching: null
        })
      }

    case REQUEST_PATCH_CODE_FILE:
      return {
        ...state,
        [action.patchId]: updateCodeFile(state[action.patchId], action.index, {
          isLoading: true
        })
      }

    case REQUEST_PATCH_CODE_FILE_FAILED:
      return {
        ...state,
        [action.patchId]: updateCodeFile(state[action.patchId], action.index, {
          isLoading: false,
          errorFetching: action.reason
        })
      }

    case UPDATE_PATCH_CODE_FILE:
      return {
        ...state,
        [action.patchId]: updateCodeFile(state[action.patchId], action.index, {
          fileString: action.fileString,
          edited: true
        })
      }

    case SERVER_SAVE_PATCH_CODE_FILES:
      return {
        ...state,
        [action.patchId]: state[action.patchId].map(file => {
          return {
            ...file,
            isSaving: true
          }
        })
      }

    case SERVER_SAVE_PATCH_CODE_FILES_SUCCESS:
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

    case SERVER_SAVE_PATCH_CODE_FILES_FAIL:
      return {
        ...state,
        [action.patchId]: state[action.patchId].map(file => {
          return {
            ...file,
            isSaving: false
          }
        })
      }

    default:
      return state
  }
}

export default patchCodeFiles;