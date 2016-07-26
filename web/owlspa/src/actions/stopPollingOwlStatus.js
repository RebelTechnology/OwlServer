import { owlCmd } from 'lib';

const stopPollingOwlStatus = (patch) => {
  return (dispatch) => {
    owlCmd.stopPollingOwlStatus();
  }
}

export default stopPollingOwlStatus;