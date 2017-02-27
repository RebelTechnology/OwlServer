import {
  API_END_POINT,
  SERVER_REMOVE_PATCH_STAR_FAILED
} from 'constants';

const serverRemovePatchStar = (patchId, user, patchSeoName, lastStarState) => {
  return (dispatch) => {
    return fetch( API_END_POINT + '/patch/' + patchId + '/star', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
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
        type: SERVER_REMOVE_PATCH_STAR_FAILED,
        patchSeoName,
        star: lastStarState
      });
    });
  }
}

export default serverRemovePatchStar;