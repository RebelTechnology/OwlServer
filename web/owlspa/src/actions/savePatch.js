import {
  API_END_POINT,
  PATCH_SAVING,
  PATCH_SAVED,
  ERROR_SAVING_PATCH
} from 'constants';
import newDialog from './newDialog';

const savePatch = (patch) => {
  return (dispatch) => {
    console.log('saving patch:', patch);
    dispatch({
      type: PATCH_SAVING
    });

    let path, method;

   if(!patch._id){
        path = '/patches/';
        method = 'POST';
    } else {
        path = '/patch/' + patch._id;
        method = 'PUT';
    }

    return fetch( API_END_POINT + path, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: method,
      credentials: 'same-origin',
      body: JSON.stringify({ patch })
    })
      .then(response => {
        return response.json();
      })
      .then( response => {
        if (response.status >= 400) {
          if(response.message){
            throw new Error(response.message);
          } else {
            throw new Error('bad status: ' + response.status);
          }
        } 

        dispatch({
          type: PATCH_SAVED
        });
        
      }).catch((err) => {
        dispatch(newDialog({
          header: 'Error Saving Patch',
          isError : true,
          tabs:[{
            header :'Error',
            isError: true,
            contents: err.message
          }] 
        }));
        dispatch({
          type: ERROR_SAVING_PATCH
        });
      });
  }
}

export default savePatch;