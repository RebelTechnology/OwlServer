import fetch from 'isomorphic-fetch';
import {
  API_END_POINT,
  REQUEST_AUTHORS,
  RECEIVE_AUTHORS
} from 'constants';

const fetchAuthors = () => {
  return (dispatch) => {
    dispatch({
      type: REQUEST_AUTHORS
    });

    return fetch( API_END_POINT + '/authors/')
      .then(response => {
        return response.json();
      })
      .then( response => {
          if (response.status >= 400) {
            console.error('bad status:', response.status);
          } else {
            dispatch({
              type: RECEIVE_AUTHORS,
              authors: response.result
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
}

export default fetchAuthors;