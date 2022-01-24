import { getScript } from 'utils';

import {
  API_END_POINT,
} from 'constants';

import newDialog from './newDialog';

const fetchPatchJavaScriptFile = (patch) => {
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_PATCH_JAVASCRIPT'
    });
    return getScript(API_END_POINT + '/builds/'+ patch._id +'?format=js&download=0&cachebust='+ new Date().getTime())
      .then(()=>{
        dispatch({
          type: 'LOADED_PATCH_JAVASCRIPT',
          isFetching: false,
          patchId: patch._id
        });
      }).catch(err => {
        console.error(err);
        dispatch({
          type: 'RESET_PATCH_JAVASCRIPT'
        });
        dispatch(newDialog({
          header: 'Error trying to run the patch',
          isError: true,
          tabs: [{
            header: 'Error',
            isError: true,
            contents: 'There was an error trying to load or run this patch in the browser.'
          }]
        }));
      })
  }
}

export default fetchPatchJavaScriptFile;
