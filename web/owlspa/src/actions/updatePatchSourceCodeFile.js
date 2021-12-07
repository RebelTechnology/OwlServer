const updatePatchSourceCodeFile = (patchId, index, fileString) => {
  return {
    type: 'UPDATE_PATCH_SOURCE_FILE',
    patchId,
    fileString,
    index
  };
}

export default updatePatchSourceCodeFile;
