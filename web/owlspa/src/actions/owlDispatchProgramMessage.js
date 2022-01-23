import { dispatch } from '../index';
import { formatBytes } from '../utils';

const owlDispatchProgramMessage = (msg) => {
  let s = msg.match(/Storage (\d+)\/(\d+)/);

  let m = ['MESSAGE', msg];
  if (s) m = ['STORAGE', formatBytes(s[1]).string + " / " + formatBytes(s[2]).string];

  dispatch({
    type: 'OWL_PROGRAM_MESSAGE_RECEIVED',
    programMessage: m
  });
}

export default owlDispatchProgramMessage;
