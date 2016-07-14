import { SET_WEB_AUDIO_PATCH, SET_PATCH_PLAYING } from 'constants';

const initialState = {
  instance: null,
  isReady: false,
  isPlaying: false
};

const webAudioPatch = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB_AUDIO_PATCH:
      return {
        instance: action.instance,
        isReady: action.isReady
      }
    case SET_PATCH_PLAYING:
      return {
        ...state,
        isPlaying: action.isPlaying
      }
    default:
      return state
  }
}

export default webAudioPatch;