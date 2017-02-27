import { 
  REQUEST_PATCH_DETAILS,
  RECEIVE_PATCH_DETAILS,
  EDIT_PATCH_DETAILS,
  PATCH_DELETED,
  PATCH_SAVING,
  PATCH_SAVED,
  ERROR_SAVING_PATCH,
  REQUEST_COMPILE_PATCH,
  RECEIVE_COMPILE_PATCH,
  PATCH_COMPILATION_FAILED,
  SET_PATCH_STAR
} from 'constants';

const initialState = {
  isSaving: false,
  isFetching: false,
  patches: {}
};

const getUpdatedStarList = (starList=[], { user, starred }) => {
  if (!user){
    return starList;
  }

  if(!starred){
    return starList.filter(star => {
      return star.user !== user;
    });
  }

  return [
    ...starList,
    { user }
  ]
}

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
    case SET_PATCH_STAR:
      return {
        ...state,
        patches: {
          ...state.patches,
          [action.patchSeoName]:{
            ...state.patches[action.patchSeoName],
            starList: getUpdatedStarList(state.patches[action.patchSeoName].starList, action)
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
    case PATCH_SAVING:
      return {
        ...state,
        isSaving: true
      }
    case PATCH_SAVED:
      return {
        ...state,
        isSaving: false
      }
    case ERROR_SAVING_PATCH:
      return {
        ...state,
        isSaving: false
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