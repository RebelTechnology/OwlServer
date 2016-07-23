import { SET_WEB_AUDIO_PATCH_PARAMETER } from 'constants';

const setWebAudioPatchParameter = (parameter) => {
  return {
    type: SET_WEB_AUDIO_PATCH_PARAMETER,
    parameter
  }; 
}

export default setWebAudioPatchParameter;