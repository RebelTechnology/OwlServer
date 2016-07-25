import {
  BEGIN_LOAD_PATCH_ON_TO_OWL,
  COMPLETE_LOAD_PATCH_ON_TO_OWL
} from 'constants';
import { owlCmd } from 'lib';
import newDialog from './newDialog';

const loadPatchOnToOwl = (patch) => {
  return (dispatch) => {
    dispatch({
      type: BEGIN_LOAD_PATCH_ON_TO_OWL
    });

    return owlCmd.loadPatchFromServer(patch._id).then(result => {
      dispatch({
        type: COMPLETE_LOAD_PATCH_ON_TO_OWL,
        patchLoaded: true
      });
    }, (err)=>{
      dispatch({
        type: COMPLETE_LOAD_PATCH_ON_TO_OWL,
        patchLoaded: false
      });
      console.error(err);
      dispatch(newDialog({
        header: 'Failed to load patch on to Owl',
        isError : true,
        tabs:[{
          header :'Error',
          isError: true,
          contents: 'Failed to load patch to Owl'
        }] 
      }));
    });
  }
}

export default loadPatchOnToOwl;