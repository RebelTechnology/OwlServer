import {
  UPDATE_COMPILATION_TYPE
} from 'constants';

const updateCompilationType = (compilationType) => {
  return {
    type: UPDATE_COMPILATION_TYPE,
    compilationType
  };
}

export default updateCompilationType;