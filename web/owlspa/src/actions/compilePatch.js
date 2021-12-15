import {
  API_END_POINT,
} from 'constants';

import newDialog from './newDialog';
import fetchPatchDetails from './fetchPatchDetails';
import fetchPatchJavaScriptFile from './fetchPatchJavaScriptFile';

const compilePatch = (patch) => {
  return (dispatch) => {
    if(!patch){
      return;
    }
    dispatch({
      type: 'REQUEST_COMPILE_PATCH',
      patchSeoName: patch.seoName
    });

    return fetch( API_END_POINT + '/builds/' + patch._id, {method: 'PUT', credentials: 'same-origin'})
      .then(response => {
        return response.json().then(json =>{ // todo: shouldn't try to parse the response as json before checking the status
          if(response.status >= 400){
            throw new Error(json.message);
          }
          return json;
        });
      })
      .then( json => {
        if(json.success){
          dispatch({
            type: 'RECEIVE_COMPILE_PATCH',
            patchSeoName: patch.seoName
          });
          dispatch(fetchPatchDetails(patch.seoName));
          dispatch(fetchPatchJavaScriptFile(patch))
        } else {
          dispatch({
            type: 'PATCH_COMPILATION_FAILED',
            patchSeoName: patch.seoName
          });
        }

        dispatch(newDialog({
          header: 'Patch Compilation ' + (json.success ? 'Succeeded' : 'Failed'),
          activeDialogTab: json.success ? 0 : 1,
          isError: !json.success,
          tabs: [
            {
              header: 'stdout',
              contents: json.stdout
            },
            {
              header: 'stderr',
              isError: !json.success,
              contents: json.stderr
            }
          ]
        }));
      }).catch((err) => {
        console.error(err);
        dispatch({
          type: 'PATCH_COMPILATION_FAILED',
          patchSeoName: patch.seoName
        });
        dispatch(newDialog({
          header: 'Error',
          isError: true,
          tabs: [{
            header: 'Error',
            isError: true,
            contents: err.message
          }]
        }));
      });
  }
}

export default compilePatch;
