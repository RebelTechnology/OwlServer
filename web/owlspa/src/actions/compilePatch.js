
import {
  API_END_POINT,
  REQUEST_COMPILE_PATCH,
  RECEIVE_COMPILE_PATCH
} from 'constants';

const compilePatch = (patch) => {
  return (dispatch) => {
    if(!patch){
      return;
    }
    dispatch({
      type: REQUEST_COMPILE_PATCH,
      patchSeoName: patch.seoName
    });

    return fetch( API_END_POINT + '/builds/' + patch._id, {method:'PUT', credentials: 'same-origin'})
      .then(response => {
        return response.json().then(json =>{
          if(response.status >= 400){
            throw new Error(json.message);
          }
          return json;
        });
      })
      .then( json => {
          console.log('SUCCESS!!', json);
          dispatch({
            type: RECEIVE_COMPILE_PATCH,
            patchSeoName: patch.seoName,
            result: json
          });
      }).catch((err) => {
        window.alert(err);
      });
  }
}

export default compilePatch;