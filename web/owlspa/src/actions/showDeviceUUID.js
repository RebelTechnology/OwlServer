import { owlCmd } from 'lib';

const showDeviceUUID = () => {
  return (dispatch) => {
    owlCmd.showDeviceUUID();
  }
}

export default showDeviceUUID;
