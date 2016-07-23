import { SET_PATCH_PLAYING } from 'constants';

const setPatchPlaying = (isPlaying) => {
  return {
    type: SET_PATCH_PLAYING,
    isPlaying
  };
}

export default setPatchPlaying;