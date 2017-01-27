import customHistory from '../customHistory';
import { compilePatch, cleanUpTmpPatchFiles } from 'actions';
import {
  API_END_POINT,
  PATCH_SAVING,
  PATCH_SAVED,
  ERROR_SAVING_PATCH,
  ERROR_IN_SOURCE_FILE_URL,
  INVALID_FIELD_DATA
} from 'constants';
import newDialog from './newDialog';

const redirectToPatchDetails = (patchSeoName) => {
  customHistory.push('/patch/'+ patchSeoName);
}

const serverSavePatch = (patch, options = {}) => {
  return (dispatch) => {
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
          return json;
        });
      })
      .then( json => {

        if(json._id){
          dispatch({type: PATCH_SAVED});
          if(method === 'POST'){
            dispatch(cleanUpTmpPatchFiles(json._id)).then(() => {
              if(options.compile){
                dispatch(compilePatch({
                  seoName: json.seoName,
                  _id: json._id
                })).then(()=>{
                  redirectToPatchDetails(json.seoName);
                });
              } else {
                redirectToPatchDetails(json.seoName);
              }
            });
          }
        } else {
          throw new Error('Error saving patch: patch ID missing');
        }

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

export default serverSavePatch;
