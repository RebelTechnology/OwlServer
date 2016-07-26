import { getScript } from 'utils';
import { 
  API_END_POINT,
  REQUEST_PATCH_JAVASCRIPT,
  LOADED_PATCH_JAVASCRIPT
} from 'constants';
import newDialog from './newDialog';

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
        dispatch(newDialog({
          header: 'Error trying to run the patch',
          isError : true,
          tabs:[{
            header :'Error',
            isError: true,
            contents: 'Darn it there was an Error trying to load or run this patch in the browser.'
          }] 
        }));
        console.error(err);
      })
  }
}

export default fetchPatchJavaScriptFile;