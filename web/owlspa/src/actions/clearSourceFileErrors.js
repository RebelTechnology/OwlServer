import {
  CLEAR_SOURCE_FILE_ERRORS
} from 'constants';


const clearSourceFileErrors = () => {
  return {
    type: CLEAR_SOURCE_FILE_ERRORS,
  };
}

export default clearSourceFileErrors;