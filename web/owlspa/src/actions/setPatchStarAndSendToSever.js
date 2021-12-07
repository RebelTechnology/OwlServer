import clientAddPatchStar from './clientAddPatchStar';
import clientRemovePatchStar from './clientRemovePatchStar';
import serverAddPatchStar from './serverAddPatchStar';
import serverRemovePatchStar from './serverRemovePatchStar';

const setPatchStarAndSendToSever = ({add, star, patchSeoName, patchId}) => {
  return dispatch => {
    //optimistically set client state for star but if server fails revert.
    if(add){
      dispatch(clientAddPatchStar({star, patchSeoName}));
      dispatch(serverAddPatchStar(patchId))
        .then( response => {
          // add server generated star timestamp to existing client star
          dispatch(clientAddPatchStar({
            star:{
              userId: response.result.userId,
              timeStamp: response.result.timeStamp
            },
            patchSeoName
          }))
        })
        .catch( err => {
          console.error('error adding star to patch');
          // remove failed client star
          console.error(err);
          dispatch(clientRemovePatchStar({ star, patchSeoName }));
        });
    } else {
      dispatch(clientRemovePatchStar({star, patchSeoName}));
      dispatch(serverRemovePatchStar(patchId, star, patchSeoName)).catch( err => {
        console.error('error removing star from patch');
        console.error(err);
        // add star back
        dispatch(clientAddPatchStar({ star, patchSeoName }));
      });
    }
  }
}

export default setPatchStarAndSendToSever;
