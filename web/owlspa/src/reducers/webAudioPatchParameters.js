import { SET_WEB_AUDIO_PATCH_PARAMETER } from 'constants';

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
    default:
      return state
  }
}

export default webAudioPatchParameters;