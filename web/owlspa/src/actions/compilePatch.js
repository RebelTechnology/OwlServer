
import {
  API_END_POINT,
  REQUEST_COMPILE_PATCH,
  RECEIVE_COMPILE_PATCH
} from 'constants';

import newDialog from './newDialog';
import fetchPatchDetails from './fetchPatchDetails';

const compilePatch = (patch) => {
  return (dispatch) => {
    if(!patch){
      return;
    }
    dispatch({
      type: REQUEST_COMPILE_PATCH,
      patchSeoName: patch.seoName
    });

    return fetch( API_END_POINT + '/builds/' + patch._id, {method:'PUT', credentials: 'same-origin'})
      .then(response => {
        return response.json().then(json =>{
          if(response.status >= 400){
            throw new Error(json.message);
          }
          return json;
        });
      })
      .then( json => {
        dispatch({
          type: RECEIVE_COMPILE_PATCH,
          patchSeoName: patch.seoName
        });

        dispatch(newDialog({
          header: 'Patch Compiltation ' + (json.success ? 'Succeeded' : 'Failed'),
          activeDialogTab:json.success ? 0 : 1,
          isError : !json.success,
          tabs:[
            { header:'stdout',
              contents:json.stdout
            },
            {
              header :'stderr',
              isError: !json.success,
              contents:json.stderr
            }
          ] 
        }));
        
        if(json.success){
          dispatch(fetchPatchDetails(patch.seoName));
        }
      }).catch((err) => {
        dispatch(newDialog({
          header: 'Error',
          isError : true,
          tabs:[{
            header :'Error',
            isError: true,
            contents: err
          }] 
        }));
      });
  }
}

export default compilePatch;