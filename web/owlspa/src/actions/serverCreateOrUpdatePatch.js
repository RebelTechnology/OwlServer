import customHistory from '../customHistory';
import { compilePatch, cleanUpTmpPatchFiles } from 'actions';
import {
  API_END_POINT,
} from 'constants';
import newDialog from './newDialog';

const redirectToPatchDetails = patchSeoName => {
  customHistory.push('/patch/'+ patchSeoName);
}

const replaceTempDir = (fileUrl, patchId) => {
  const tempDirRegex = /\/tmp-.+\//;
  if(!tempDirRegex.test(fileUrl)){
    return fileUrl;
  }

  return fileUrl.replace(tempDirRegex, '/' + patchId + '/');
}

const replaceTempDirInPatchSourceFileUrls = patch => {
  if(!patch || !patch.github || !patch.github.length){
    return patch;
  }

  return {
    ...patch,
    github: patch.github.map(fileUrl => replaceTempDir(fileUrl, patch._id))
  }
}

const serverCreateOrUpdatePatch = (patch, options = {}) => {
  return (dispatch) => {
    dispatch({
      type: 'PATCH_SAVING'
    });

    let path = '/patches/';
    let method = 'POST';

    if(patch._id){
      path = '/patch/' + patch._id;
      method = 'PUT';
    }

    return fetch( API_END_POINT + path, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: method,
      credentials: 'same-origin',
      body: JSON.stringify({ patch })
    })
      .then(response => {
        return response.json().then(json => {
          if(json.type === 'not_valid' && json.field){
            if(json.field === 'github'){
              dispatch({
                type: 'ERROR_IN_SOURCE_FILE_URL',
                index: json.index,
                error: json.message || 'error with file url'
              });
            } else {
              dispatch({
                type: 'INVALID_FIELD_DATA',
                field: json.field,
                error: json.message
              });
            }
          }

          if (response.status >= 400) {
            if(json.message){
              throw new Error(json.message);
            } else {
              throw new Error('Error saving patch');
            }
          }
          return json;
        });
      })
      .then( json => {
        if(!json.patch){
          throw new Error('Error saving patch: updated patch missing');
        }

        return dispatch(cleanUpTmpPatchFiles(json.patch._id)).then(() => {

          dispatch({
            type: 'PATCH_SAVED',
            patch: replaceTempDirInPatchSourceFileUrls(json.patch)
          });

          if(options.compile){
            dispatch(compilePatch({
              seoName: json.patch.seoName,
              _id: json.patch._id
            }));
          }

          return json.patch.seoName;
        });

      })
      .then(seoName => {
        redirectToPatchDetails(seoName);
      })
      .catch((err) => {
        console.error(err);
        dispatch(newDialog({
          header: 'Error Saving Patch',
          isError : true,
          tabs:[{
            header :'Error',
            isError: true,
            contents: err.message
          }]
        }));
        dispatch({
          type: 'ERROR_SAVING_PATCH'
        });
      });
  }
}

export default serverCreateOrUpdatePatch;
