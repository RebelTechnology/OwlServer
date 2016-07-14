import { getScript } from 'utils';
import { 
  API_END_POINT,
  REQUEST_PATCH_JAVASCRIPT,
  LOADED_PATCH_JAVASCRIPT
} from 'constants';

const fetchPatchJavaScriptFile = (patch) => {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PATCH_JAVASCRIPT
    });
    return getScript(API_END_POINT + '/builds/'+ patch._id +'?format=js&download=0')
      .then(()=>{
        dispatch({
          type: LOADED_PATCH_JAVASCRIPT,
          isFetching: false,
          patchId: patch._id
        });
      }).catch(err => {
        console.error(err);
      })
  }
}

export default fetchPatchJavaScriptFile;