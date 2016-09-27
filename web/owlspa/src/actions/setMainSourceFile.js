import {
  SET_MAIN_SOURCE_FILE
} from 'constants';


const setMainSourceFile = (mainSourceFile) => {
  return {
    type: SET_MAIN_SOURCE_FILE,
    mainSourceFile
  };
}

export default setMainSourceFile;