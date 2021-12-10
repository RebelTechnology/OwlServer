const initialState = {
  playing: false
};

const patchPlaying = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PATCH_PLAYING':
      return {
        playing: action.playing
      };

    default:
      return state;
  }
}

export default patchPlaying;
