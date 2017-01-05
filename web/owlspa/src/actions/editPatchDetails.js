import { EDIT_PATCH_DETAILS } from 'constants';

const editPatchDetails = (patchSeoName, patchDetails) => {
  return {
    type: EDIT_PATCH_DETAILS,
    patchSeoName,
    patchDetails
  };
}

export default editPatchDetails;