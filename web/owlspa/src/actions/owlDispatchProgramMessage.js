import { dispatch } from '../index';

const owlDispatchProgramMessage = (programMessage) => {
  dispatch({
    type: 'OWL_PROGRAM_MESSAGE_RECEIVED',
    programMessage
  });
}

export default owlDispatchProgramMessage;
