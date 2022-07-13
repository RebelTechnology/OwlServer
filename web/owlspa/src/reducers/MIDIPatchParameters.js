const initialState = [];

const MIDIPatchParameters = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_MIDI_PATCH_PARAMETER':
      return [
        ...state.filter(param => param.id !== action.parameter.id),
        action.parameter
      ];

    case 'RESET_MIDI_PATCH_PARAMETERS':
      return initialState;

    case 'RESET_MIDI_PATCH':
      return initialState;

    default:
      return state;
  }
}

export default MIDIPatchParameters;
