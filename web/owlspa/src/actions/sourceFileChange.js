const sourceFileChange = (sourceFile) => {
  return {
    type: 'SOURCE_FILE_CHANGE',
    sourceFile
  };
}

export default sourceFileChange;
