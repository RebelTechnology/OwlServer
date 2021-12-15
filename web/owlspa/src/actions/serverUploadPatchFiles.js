import {
  WORDPRESS_AJAX_END_POINT,
  PATCH_UPLOAD_DIR
} from 'constants';

import newDialog from './newDialog';

const getFileUploadToken = () => {
  let fileUploadToken = '';
  const bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 7; i++) {
      fileUploadToken += bag.charAt(Math.floor(Math.random() * bag.length));
  }
  return fileUploadToken;
}

const getFileErrors = (files) => {
  return files.reduce((prev,curr) => {
    if(curr.err){
      return prev + curr.name + ' : ' + curr.msg + '\n';
    }
  },'');
}

const serverUploadPatchFiles = (patchFileList, patchId) => {
  return (dispatch) => {
    dispatch({
      type: 'UPLOADING_PATCH_FILES'
    });

    const formData = new FormData();
    for (var i = 0; i < patchFileList.length; i++) {
      // File.name is read-only. we need to clone the file and rename it to avoid server compilation problems.
      //
      const f = new File(
        [patchFileList[i]],
        patchFileList[i].name.replace(/[^a-z0-9\.\-]+/gi, '_'),
        { type: patchFileList[i].type }
      );

      if(f.toString() === '[object File]'){
        formData.append('files[]', f);
      }

      if(f.toString() === '[object Blob]'){
        formData.append('files[]', f, f.name);
      }
    }

    if (patchId) {
      formData.append('patchId', patchId);
    } else {
      formData.append('fileUploadToken', getFileUploadToken());
    }

    formData.append('action', 'owl-patch-file-upload'); // WordPress action

    return fetch( WORDPRESS_AJAX_END_POINT, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    })
      .then(response => {
        return response.json();
      })
      .then( response => {
        if (response.status >= 400) {
          throw new Error('bad server status: ' + response.status);
        }

        if(!response.files){
          throw new Error('no files returned from server');
        }

        const fileErrors = getFileErrors(response.files)
        if(fileErrors){
          throw new Error(fileErrors);
        } else {
          const files = response.files.map(file => {
            file.path = PATCH_UPLOAD_DIR + file.path;
            return file;
          });
          dispatch({
            type: 'PATCH_FILES_UPLOADED',
            files: files
          });

          return {
            success: true
          };
        }
      }).catch((err) => {

        console.error && console.error(err);

        dispatch(newDialog({
          header: 'File Upload Error',
          isError: true,
          tabs: [{
            header: 'Error',
            isError: true,
            contents: err.message
          }]
        }));

        dispatch({
          type: 'ERROR_UPLOADING_PATCH_FILE'
        });

        return {
          error: err.message
        };
      });
  }
}

export default serverUploadPatchFiles;
