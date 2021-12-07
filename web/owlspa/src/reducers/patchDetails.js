const initialState = {
  isSaving: false,
  savedSuccess: false,
  isFetching: false,
  patches: {},
  patchSeoNameChanged: null
};

const removeStarFromList = (starList=[], star) => {
  if (!star || !star.userId){
    return starList;
  }
  return starList.filter(existingStar => existingStar.userId !== star.userId);
};

const addOrUpdateStarInList = (starList=[], star) => {
  if (!star || !star.userId){
    return starList;
  }
  return [
    ...removeStarFromList(starList, star),
    star
  ];
};

const updatePatchesWithNewPatchSeoName = (patches, oldSeoName, newSeoName, newPatchName) => {
  const newPatches = {
    ...patches,
    [newSeoName]: {
      ...patches[oldSeoName],
      seoName: newSeoName,
      name: newPatchName
    }
  };

  delete newPatches[oldSeoName];
  return newPatches;
}

const patchDetails = (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_PATCH_DETAILS':
      return {
        ...state,
        isFetching: true
      };

    case 'RECEIVE_PATCH_DETAILS':
      return {
        ...state,
        isFetching: false,
        patches: {
          ...state.patches,
          [action.patchDetails.seoName]:action.patchDetails
        }
      };

    case 'CLIENT_ADD_PATCH_STAR':
      return {
        ...state,
        patches: {
          ...state.patches,
          [action.patchSeoName]:{
            ...state.patches[action.patchSeoName],
            starList: addOrUpdateStarInList(state.patches[action.patchSeoName].starList, action.star)
          }
        }
      };

    case 'CLIENT_REMOVE_PATCH_STAR':
      return {
        ...state,
        patches: {
          ...state.patches,
          [action.patchSeoName]:{
            ...state.patches[action.patchSeoName],
            starList: removeStarFromList(state.patches[action.patchSeoName].starList, action.star)
          }
        }
      };

    case 'PATCH_DELETED':
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: null
        }
      };

    case 'PATCH_SAVING':
      return {
        ...state,
        savedSuccess: false,
        isSaving: true,
        patchSeoNameChanged: null
      };

    case 'PATCH_SAVED':
      return {
        ...state,
        savedSuccess: true,
        isSaving: false,
        patches : {
          ...state.patches,
          [action.patch.seoName]: action.patch
        }
      };

    case 'ERROR_SAVING_PATCH':
      return {
        ...state,
        isSaving: false
      };

    case 'PATCH_SEO_NAME_CHANGED':
      return {
        ...state,
        patchSeoNameChanged: action.newSeoName,
        patches: updatePatchesWithNewPatchSeoName(state.patches, action.oldSeoName, action.newSeoName, action.newPatchName)
      };

    case 'REQUEST_COMPILE_PATCH':
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: {
            ...state.patches[action.patchSeoName],
            isCompiling: true
          }
        }
      };

    case 'RECEIVE_COMPILE_PATCH':
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: {
            ...state.patches[action.patchSeoName],
            isCompiling: false
          }
        }
      };

    case 'PATCH_COMPILATION_FAILED':
      return {
        ...state,
        patches : {
          ...state.patches,
          [action.patchSeoName]: {
            ...state.patches[action.patchSeoName],
            isCompiling: false
          }
        }
      };

    default:
      return state;
  }
}

export default patchDetails;
