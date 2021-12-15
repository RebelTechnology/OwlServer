import {
  API_END_POINT,
} from 'constants';

import customHistory from '../customHistory';

const deletePatch = (patch, options = {}) => {
  return (dispatch) => {
    if(!window.confirm('Are you sure you want to delete this patch?')){
      return;
    }

    if(!patch || !patch._id){
      return;
    }

    dispatch({
      type: 'REQUEST_DELETE_PATCH',
      patchSeoName: patch.seoName
    });

    return fetch( API_END_POINT + '/patch/' + patch._id, {method: 'DELETE', credentials: 'same-origin'})
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
          type: 'PATCH_DELETED',
          patchSeoName: patch.seoName,
          message: json.message
        });
        if(options.redirect){
          customHistory.push('/patches/' + options.redirect);
        }
      })
      .catch((err) => {
        window.alert(err);
      });
  }
}

export default deletePatch;
