import { 
  SET_WEB_AUDIO_PATCH_PARAMETER,
  RESET_WEB_AUDIO_PATCH_PARAMETERS,
  RESET_WEB_AUDIO_PATCH } from 'constants';

const initialState = [];

const webAudioPatchParameters = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB_AUDIO_PATCH_PARAMETER:
      return [
        ...state.filter(param => param.id !== action.parameter.id),
        action.parameter
      ];
    case RESET_WEB_AUDIO_PATCH_PARAMETERS:
      return initialState;
    case RESET_WEB_AUDIO_PATCH:
      return initialState;
    default:
      return state
  }
}

export default webAudioPatchParameters;