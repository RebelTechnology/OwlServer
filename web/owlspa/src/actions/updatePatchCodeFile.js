import {
  UPDATE_PATCH_CODE_FILE
} from 'constants';


const updatePatchCodeFile = (patchId, index, fileString) => {
  return {
    type: UPDATE_PATCH_CODE_FILE,
    patchId,
    fileString,
    index
  };
}

export default updatePatchCodeFile;