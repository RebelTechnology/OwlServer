import {
  SERVER_SAVE_PATCH_CODE_FILES,
  SERVER_SAVE_PATCH_CODE_FILES_SUCCESS,  
  SERVER_SAVE_PATCH_CODE_FILES_FAIL 
} from 'constants';
import serverUploadPatchFiles from './serverUploadPatchFiles';
import compilePatch from './compilePatch';
import newDialog from './newDialog';

const getFileNameFromUrl = (url) => {
  return url.split('/').slice(-1)[0];
};

const serverSavePatchFiles = (patch, codeFiles, options = {}) => {
  return (dispatch) => {

    dispatch({
      type: SERVER_SAVE_PATCH_CODE_FILES,
      patchId: patch._id
    });

    let fileList;
    
    try {
      fileList = codeFiles.map(file => {
        return new File([file.fileString], getFileNameFromUrl(file.fileUrl), {type : 'application/octet-stream'});
      });
    } catch (e) {

      try {
        fileList = codeFiles.map(file => {
          let blob = new Blob([file.fileString], {type : 'application/octet-stream'});
          blob.lastModifiedDate = new Date();
          blob.name = getFileNameFromUrl(file.fileUrl);
          return blob
        });
      } catch (e) {
        dispatch(newDialog({
          header: 'File Save Error',
          isError : true,
          tabs:[{
            header :'Error',
            isError: true,
            contents: 'your browser is unable to save files: '
          }] 
        }));

        dispatch({
          type: SERVER_SAVE_PATCH_CODE_FILES_FAIL,
          patchId: patch._id
        });

        return;
      }
    }
    
    dispatch(serverUploadPatchFiles(fileList, patch._id)).then(res => {
      
      if(res.success){
        dispatch({
          type: SERVER_SAVE_PATCH_CODE_FILES_SUCCESS,
          patchId: patch._id
        });
        if(options.compile){
          dispatch(compilePatch(patch));
        }
      }

      if(res.error){
        dispatch({
          type: SERVER_SAVE_PATCH_CODE_FILES_FAIL,
          patchId: patch._id
        });
      }

    })
  }
};

export default serverSavePatchFiles;