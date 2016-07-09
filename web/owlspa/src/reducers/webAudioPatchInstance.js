import { SET_WEB_AUDIO_PATCH_INSTANCE } from 'constants';

const initialState = {
  patchInstance: null
};

const webAudioPatchInstance = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB_AUDIO_PATCH_INSTANCE:
      return {
        patchInstance: action.patchInstance
      }
    default:
      return state
  }
}

export default webAudioPatchInstance;