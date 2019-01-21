import { owlCmd } from 'lib';

const eraseDeviceStorage = () => {
  return (dispatch) => {
    owlCmd.eraseDeviceStorage();
  }
}

export default eraseDeviceStorage;
