import customHistory from '../customHistory';
import { 
  REQUEST_PATCH_DETAILS,
  RECEIVE_PATCH_DETAILS,
  API_END_POINT
} from 'constants';

const fetchPatchDetails = (patchSeoName) => {
  return (dispatch) => {

    dispatch({
      type: REQUEST_PATCH_DETAILS
    });

    return fetch(API_END_POINT + '/patch/?seoName='+ patchSeoName)
      .then(response => {
        return response.json();
      })
      .then( response => {
          if (response.status >= 400) {
            console.error('bad status:', response.status);
            if(response.status === 404){
              customHistory.push('/patch-not-found');
            }
          } else {
            dispatch({
              type: RECEIVE_PATCH_DETAILS,
              patchDetails: response.result
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
}

export default fetchPatchDetails;