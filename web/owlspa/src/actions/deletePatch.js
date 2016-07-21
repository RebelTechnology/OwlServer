
import customHistory from '../customHistory';
import {
  API_END_POINT,
  REQUEST_DELETE_PATCH,
  PATCH_DELETED
} from 'constants';

const deletePatch = (patch) => {
  return (dispatch) => {
    if(!window.confirm('Are you sure you want to delete this patch?')){
      return;
    }

    if(!patch || !patch._id){
      return;
    }

    dispatch({
      type: REQUEST_DELETE_PATCH,
      patchSeoName: patch.seoName
    });

    return fetch( API_END_POINT + '/patch/' + patch._id, {method:'DELETE', credentials: 'same-origin'})
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
          type: PATCH_DELETED,
          patchSeoName: patch.seoName,
          message: json.message
        });
        window.alert(json.message);
        customHistory.push('/patches/latest');
      })
      .catch((err) => {
        window.alert(err);
      });
  }
}

export default deletePatch;