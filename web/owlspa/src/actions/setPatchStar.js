import { SET_PATCH_STAR } from 'constants';
import serverAddPatchStar from './serverAddPatchStar';
import serverRemovePatchStar from './serverRemovePatchStar';

const setPatchStar = ({starred, user, patchSeoName, patchId}) => {
  return (dispatch, getState) => {
    const { patchDetails } = getState();
    const patch = patchDetails.patches[patchSeoName];
    const lastStarState = patch.starList.find(star => star.user === user);
    //optimistically set client state for star and if server fails revert. 
    dispatch({
      type: SET_PATCH_STAR,
      starred,
      user,
      patchSeoName
    });

    if(starred){
      dispatch(serverAddPatchStar(patchId, user, patchSeoName));
    } else {
      dispatch(serverRemovePatchStar(patchId, user, patchSeoName, lastStarState));
    }
  }
}

export default setPatchStar;