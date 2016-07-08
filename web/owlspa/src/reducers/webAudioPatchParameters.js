import { SET_WEB_AUDIO_PATCH_PARAMETER } from 'constants';

const initialState = [];

const getNewArray = (parameter, state)=>{
  let arr = state.slice(0);
  arr[parameter.index] = parameter;
  return arr;
}

const webAudioPatchParameters = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB_AUDIO_PATCH_PARAMETER:
      return getNewArray(action.parameter, state);
    default:
      return state
  }
}

export default webAudioPatchParameters;