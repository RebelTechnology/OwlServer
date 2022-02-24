const setMIDIPatchParameter = (parameter) => {
  return {
    type: 'SET_MIDI_PATCH_PARAMETER',
    parameter
  };
}

export default setMIDIPatchParameter;
