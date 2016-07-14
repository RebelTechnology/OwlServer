import fetch from 'isomorphic-fetch';
import {
  API_END_POINT,
  REQUEST_TAGS,
  RECEIVE_TAGS
} from 'constants';

const fetchTags = () => {
  return (dispatch) => {
    dispatch({
      type: REQUEST_TAGS
    });

    return fetch( API_END_POINT + '/tags/')
      .then(response => {
        return response.json();
      })
      .then( response => {
          if (response.status >= 400) {
            console.error('bad status:', response.status);
          } else {
            dispatch({
              type: RECEIVE_TAGS,
              tags: response.result
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
}

export default fetchTags;