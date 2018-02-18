import {
  WORDPRESS_AJAX_END_POINT
} from 'constants';

// why does the client need to do this? this should happen on server automatically after uploading new files.
const cleanUpTmpPatchFiles = (patchId) => {
  return (dispatch) => {
    if(!patchId){
      return;
    }

    return fetch( WORDPRESS_AJAX_END_POINT + '?action=owl-patch-file-cleanup&patchId=' + patchId, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
      credentials: 'same-origin'
    }).then(response => {
      if (response.status >= 400) {
        throw new Error('error cleaning up temporary patch files, server status: ' + response.status);
      }
      return response.json();
    }).then(json => {
      if (json.err){
        throw new Error(json.msg);
      }
    }).catch(err => {
      console.log('unable to cleanup patchfiles:', err);
    });
  }
}

export default cleanUpTmpPatchFiles;
