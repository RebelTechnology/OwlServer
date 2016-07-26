import { 
  SET_WEB_AUDIO_PATCH_PARAMETER,
  RESET_WEB_AUDIO_PATCH_PARAMETERS,
  RESET_WEB_AUDIO_PATCH } from 'constants';

const initialState = [];

const makeNewArray = (parameter, state)=>{
  let arr = [...state];
  arr[parameter.index] = parameter;
  return arr;
}

const webAudioPatchParameters = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB_AUDIO_PATCH_PARAMETER:
      return makeNewArray(action.parameter, state);
    case RESET_WEB_AUDIO_PATCH_PARAMETERS:
      return initialState;
    case RESET_WEB_AUDIO_PATCH:
      return initialState;
    default:
      return state
  }
}

export default webAudioPatchParameters;