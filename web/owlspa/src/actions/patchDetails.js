import { 
  SET_EDIT_MODE_FOR_EACH_PATCH_DETAILS,
  EXIT_EDIT_MODE_FOR_PATCH_DETAILS
} from 'constants';

import serverSavePatch from './serverSavePatch';

export const setEditModeForPatchDetails = (patchSeoName, fieldsInEditMode) => {
  return {
    type: SET_EDIT_MODE_FOR_EACH_PATCH_DETAILS,
    patchSeoName,
    fieldsInEditMode
  };
}

export const exitEditModeForPatchDetails = (patchSeoName) => {
  return {
    type: EXIT_EDIT_MODE_FOR_PATCH_DETAILS,
    patchSeoName
  };
}

export const serverSavePatchAndExitEditMode = (patch) => {
  return (dispatch) => {
    dispatch(serverSavePatch(patch)).then(() => {
      dispatch(exitEditModeForPatchDetails(patch.seoName))
    })
  }
}