import {
  SERVER_SAVE_PATCH_CODE_FILES,
  SERVER_SAVE_PATCH_CODE_FILES_SUCCESS,  
  SERVER_SAVE_PATCH_CODE_FILES_FAIL 
} from 'constants';
import uploadPatchFiles from './uploadPatchFiles';

const getFileNameFromUrl = (url) => {
  return url.split('/').slice(-1)[0];
};

const serverSavePatchFiles = (patchId, codeFiles) => {
  return (dispatch) => {

    dispatch({
      type: SERVER_SAVE_PATCH_CODE_FILES,
      patchId
    });
    
    let fileList = codeFiles.map(file => {
      return new File([file.fileString], getFileNameFromUrl(file.fileUrl), {type : 'application/octet-stream'});
    });
    
    dispatch(uploadPatchFiles(fileList, patchId)).then(res => {
      
      if(res.success){
        dispatch({
          type: SERVER_SAVE_PATCH_CODE_FILES_SUCCESS,
          patchId
        });
      }

      if(res.error){
        dispatch({
          type: SERVER_SAVE_PATCH_CODE_FILES_FAIL,
          patchId
        });
      }

    })
  }
};

export default serverSavePatchFiles;