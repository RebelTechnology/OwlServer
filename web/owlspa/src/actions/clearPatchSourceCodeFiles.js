import { CLEAR_PATCH_SOURCE_CODE_FILES } from 'constants';

const clearPatchSourceCodeFiles = patchId => {
  console.log('clearing source files for patch', patchId);
  return {
    type: CLEAR_PATCH_SOURCE_CODE_FILES,
    patchId
  };
}

export default clearPatchSourceCodeFiles;