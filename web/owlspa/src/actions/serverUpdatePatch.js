import {
  API_END_POINT,
  PATCH_SAVING,
  PATCH_SAVED,
  PATCH_SEO_NAME_CHANGED,
  ERROR_SAVING_PATCH,
  ERROR_IN_SOURCE_FILE_URL,
  INVALID_FIELD_DATA
} from 'constants';
import newDialog from './newDialog';

const serverUpdatePatch = (patch) => {
  return (dispatch) => {
    dispatch({
      type: PATCH_SAVING
    });

    return fetch( API_END_POINT + '/patch/' + patch._id, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PUT',
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
              throw new Error('Error updating patch');
            }
          } 
          return json;
        });
      })
      .then( json => {
        
        if(json._id){
          dispatch({
            type: PATCH_SAVED
          });
          if(patch.seoName !== json.seoName){
            dispatch({
              type: PATCH_SEO_NAME_CHANGED,
              newSeoName: json.seoName,
              oldSeoName: patch.seoName,
              newPatchName: patch.name
            });
          }
          return { patchUpdated: true };
        } else {
          throw new Error('Error updating patch: patch ID missing');
        }
        
      }).catch((err) => {
        dispatch(newDialog({
          header: 'Error Updating Patch',
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

export default serverUpdatePatch;