import {
  REMOVE_UPLOADED_FILE
} from 'constants';


const removeUploadedPatchFile = (fileName) => {
  return {
    type: REMOVE_UPLOADED_FILE,
    fileName
  };
}

export default removeUploadedPatchFile;