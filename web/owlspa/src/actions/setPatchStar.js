import { SET_PATCH_STAR } from 'constants';

const setPatchStar = ({starred, user, patchSeoName}) => {
  return {
    type: SET_PATCH_STAR,
    starred,
    user,
    patchSeoName
  };
}

export default setPatchStar;