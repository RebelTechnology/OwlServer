
import {
  API_END_POINT,
  REQUEST_PATCHES,
  RECEIVE_PATCHES
} from 'constants';

const fetchPatches = () => {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PATCHES
    });

    return fetch( API_END_POINT + '/patches/')
      .then(response => {
        return response.json();
      })
      .then( response => {
          if (response.status >= 400) {
            console.error('bad status:', response.status);
          } else {
            dispatch({
              type: RECEIVE_PATCHES,
              patches: response.result
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
}

export default fetchPatches;