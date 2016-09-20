import {
  UPDATE_PATCH_NAME
} from 'constants';


const updatePatchName = (patchName) => {
  return {
    type: UPDATE_PATCH_NAME,
    patchName
  };
}

export default updatePatchName;