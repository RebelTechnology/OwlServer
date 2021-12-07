import * as owl from 'lib/owlCmd';

import newDialog from './newDialog';

const loadAndRunPatchOnDevice = (patch) => {
  return (dispatch) => {

    owl.pollStatusStop();

    dispatch({
      type: 'BEGIN_LOAD_PATCH_ON_TO_OWL'
    });

    return owl.loadAndRunPatchOnDevice(patch._id).then(result => {
      dispatch({
        type: 'COMPLETE_LOAD_PATCH_ON_TO_OWL',
        patchLoaded: true
      });
    }, (err) => {
      dispatch({
        type: 'COMPLETE_LOAD_PATCH_ON_TO_OWL',
        patchLoaded: false
      });
      console.error(err);
      dispatch(newDialog({
        header: 'Failed to load patch on to OWL',
        isError : true,
        tabs:[{
          header :'Error',
          isError: true,
          contents: 'Failed to load patch to OWL'
        }]
      }));
    }).then(()=>{
      owl.pollStatus();
    })
  }
}

export default loadAndRunPatchOnDevice;
