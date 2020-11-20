import {
  OWL_PROGRAM_ERROR_RECEIVED
} from 'constants';

import { dispatch } from '../index';

const owlDispatchProgramError = (programError) => {
  dispatch({
    type: OWL_PROGRAM_ERROR_RECEIVED,
    programError
  });
}

export default owlDispatchProgramError;
