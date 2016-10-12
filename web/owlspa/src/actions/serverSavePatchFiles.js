import uploadPatchFiles from './uploadPatchFiles';

const getFileNameFromUrl = (url) => {
  return url.split('/').slice(-1)[0];
};

const serverSavePatchFiles = (patchId, patchCodeFiles) => {
  return (dispatch) => {
    
    let fileList = patchCodeFiles.map(clientFile => {
      return new File([clientFile.fileString], getFileNameFromUrl(clientFile.fileUrl), {type : 'application/octet-stream'});
    });
    
    dispatch(uploadPatchFiles(fileList, patchId));
  }
};

export default serverSavePatchFiles;