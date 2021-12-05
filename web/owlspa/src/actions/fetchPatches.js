import {
  API_END_POINT,
} from 'constants';

import newDialog from './newDialog';

const fetchPatches = () => {
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_PATCHES'
    });

    return fetch( API_END_POINT + '/patches/')
      .then(response => {
        if (response.status >= 500) {
          throw new Error('Sorry there is a problem with the patch server api please try again later.');
        }
        return response.json();
      })
      .then( response => {
          if (response.status >= 400) {
            throw new Error('bad server status: ' + response.status);
          } else {
            dispatch({
              type: 'RECEIVE_PATCHES',
              patches: response.result
            });
          }
        }
      ).catch( err => {
        console.error(err);
        dispatch(newDialog({
          header: 'Server Error',
          isError : true,
          tabs:[{
            header :'Error',
            isError: true,
            contents: err.message
          }]
        }));
      })
  }
}

export default fetchPatches;
