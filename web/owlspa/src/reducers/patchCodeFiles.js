import {
  REQUEST_PATCH_CODE_FILE,
  RECEIVE_PATCH_CODE_FILE,
  REQUEST_PATCH_CODE_FILE_FAILED
} from 'constants';

const initialState = {};

const patchCodeFiles = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_PATCH_CODE_FILE:
      return {
        ...state,
        [action.patchId]:{
          ...state[action.patchId],
          [action.index]:[action.fileString]
        }
      }
    case REQUEST_PATCH_CODE_FILE:
      return {
        ...state,
        [action.patchId]:{
          ...state[action.patchId],
          [action.index]: 'Loading...'
        }
      }
    case REQUEST_PATCH_CODE_FILE_FAILED:
      return {
        ...state,
        [action.patchId]:{
          ...state[action.patchId],
          [action.index]: action.reason
        }
      }
    default:
      return state
  }
}

export default patchCodeFiles;