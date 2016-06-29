import fetch from 'isomorphic-fetch';
import { REQUEST_PATCHES, RECEIVE_PATCHES } from 'constants';
import { API_END_POINT } from 'constants';

export function fetchPatches() {
  return function (dispatch) {

    dispatch({
      type: REQUEST_PATCHES,
      isFetching: true
    });

    return fetch( API_END_POINT + '/patches/')
      .then(response =>
        response.json().then(json => ({
          status: response.status,
          json
        })
      ))
      .then(
        ({ status, json }) => {
          if (status >= 400) {
            console.error('bad status:', status);
          } else {
            dispatch({
              type: RECEIVE_PATCHES,
              patches: json.result
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
}
