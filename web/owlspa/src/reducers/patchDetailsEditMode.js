import { 
  SET_EDIT_MODE_FOR_EACH_PATCH_DETAILS,
  EXIT_EDIT_MODE_FOR_PATCH_DETAILS
} from 'constants';

const initialState = {};

const patchDetailsEditMode = (state = initialState, action) => {
  switch (action.type) {
    case SET_EDIT_MODE_FOR_EACH_PATCH_DETAILS:
      return {
        ...state,
        [action.patchSeoName]: {
          ...state[action.patchSeoName],
          ...action.fieldsInEditMode
        }
      }
    case EXIT_EDIT_MODE_FOR_PATCH_DETAILS:
      return {
        ...state,
        [action.patchSeoName]: {}
      }
    default:
      return state
  }
}

export default patchDetailsEditMode;