import { SET_WEB_AUDIO_PATCH } from 'constants';

const setWebAudioPatch = (patch) => {
  return {
    type: SET_WEB_AUDIO_PATCH,
    ...patch
  };
}

export default setWebAudioPatch;