import { 
  SET_EDIT_MODE_FOR_EACH_PATCH_DETAILS,
  EXIT_EDIT_MODE_FOR_PATCH_DETAILS
} from 'constants';

import serverUpdatePatch from './serverUpdatePatch';

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

export const serverUpdatePatchAndExitEditMode = (patch) => {
  return (dispatch) => {
    dispatch(serverUpdatePatch(patch)).then((result) => {
      if(result === 'patch updated'){
        dispatch(exitEditModeForPatchDetails(patch.seoName))
      }
    })
  }
}