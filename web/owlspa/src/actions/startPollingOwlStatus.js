import { owlCmd } from 'lib';

const startPollingOwlStatus = (patch) => {
  return (dispatch) => {
    owlCmd.startPollingOwlStatus();
  }
}

export default startPollingOwlStatus;