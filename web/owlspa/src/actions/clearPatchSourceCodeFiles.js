const clearPatchSourceCodeFiles = patchId => {
  return {
    type: 'CLEAR_PATCH_SOURCE_CODE_FILES',
    patchId
  };
}

export default clearPatchSourceCodeFiles;
