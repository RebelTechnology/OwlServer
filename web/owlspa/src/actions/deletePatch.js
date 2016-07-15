import fetch from 'isomorphic-fetch';
import customHistory from '../history';
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
        return response.json();
      })
      .then( response => {
        dispatch({
          type: PATCH_DELETED,
          patchSeoName: patch.seoName,
          message: response.message
        });
        window.alert(response.message);
        customHistory.push('/patches/latest')
      })
      .catch((err) => {
          console.error(err);
      });
  }
}

export default deletePatch;