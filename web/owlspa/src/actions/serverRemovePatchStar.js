import {
  API_END_POINT
} from 'constants';

const serverRemovePatchStar = (patchId) => {
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
    });
  }
}

export default serverRemovePatchStar;
