import { owlCmd } from 'lib';

const resetDevice = () => {
  return (dispatch) => {
    owlCmd.resetDevice();
  }
}

export default resetDevice;