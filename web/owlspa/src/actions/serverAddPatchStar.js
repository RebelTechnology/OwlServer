import {
  API_END_POINT
} from 'constants';

// adds a star for the current user to the specified patch
const serverAddPatchStar = (patchId) => {
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
       return response;
    });
  }
}

export default serverAddPatchStar;