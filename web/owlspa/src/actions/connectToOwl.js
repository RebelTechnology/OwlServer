import {
  REQUEST_CONNECT_TO_OWL,
  RECEIVE_CONNECTION_FROM_OWL
} from 'constants';
import { owlCmd } from 'lib';
import newDialog from './newDialog';

const connectToOwl = () => {
  return (dispatch) => {
    dispatch({
      type: REQUEST_CONNECT_TO_OWL
    });

    return owlCmd.connectToOwl().then(result => {
      dispatch({
        type: RECEIVE_CONNECTION_FROM_OWL,
        isConnected: result.isConnected
      });
    }, (err)=>{
      dispatch({
        type: RECEIVE_CONNECTION_FROM_OWL,
        isConnected: false
      });
      console.error(err);
      dispatch(newDialog({
        header: 'Failed to Connect to Owl',
        isError : true,
        tabs:[{
          header :'Error',
          isError: true,
          contents: 'Failed to Connect to Owl'
        }] 
      }));
    });
  }
}

export default connectToOwl;