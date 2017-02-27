import {
  API_END_POINT,
  SERVER_ADD_PATCH_STAR_FAILED
} from 'constants';

const serverAddPatchStar = (patchId, user, patchSeoName) => {
  return (dispatch) => {

    return fetch( API_END_POINT + '/patch/' + patchId + '/star', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      credentials: 'same-origin',
    })
    .then(response => {
      return response.json();
    })
    .then( response => {
      if (response.status >= 400) {
        throw new Error('bad server status: ' + response.status);
      } 
    }).catch((err) => {
      console.error('error adding star to patch');
      dispatch({
        type: SERVER_ADD_PATCH_STAR_FAILED,
        user,
        patchSeoName
      });
    });
  }
}

export default serverAddPatchStar;