import {
  API_END_POINT,
  PATCH_SAVING,
  PATCH_SAVED,
  ERROR_SAVING_PATCH,
  ERROR_IN_SOURCE_FILE_URL,
  INVALID_FIELD_DATA
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
        return response.json().then(json => {       
          if(json.type === 'not_valid' && json.field){
            if(json.field === 'github'){
              dispatch({
                type: ERROR_IN_SOURCE_FILE_URL,
                index: json.index,
                error: json.message || 'error with file url'
              });
            } else {
              dispatch({
                type: INVALID_FIELD_DATA,
                field: json.field,
                error: json.message
              });
            }
          }

          if (response.status >= 400) {
            if(json.message){
              throw new Error(json.message);
            } else {
              throw new Error('Error saving patch');
            }
          } 
        });
      })
      .then( response => {
        
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