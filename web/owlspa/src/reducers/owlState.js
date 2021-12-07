const initialState = {
  isConnected: false,
  midiInputs: null,
  midiOutputs: null,
  connectedMidiInputPort: null,
  connectedMidiOutputPort: null,
  isRequesting: false,
  patchIsLoading: false,
  patchLoaded : false,
  patchIsStoring: false,
  patchStoredSuccess: false,
  activePresetSlot: null,
  firmWareVersion: null,
  status: null,
  programMessage: null,
  programError: null,
  presets: [],
  resources: [],
  uuid: null
};

const owlState = (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_CONNECT_TO_OWL':
      return {
        ...state,
        isRequesting: true,
        isConnected: false
      }
    case 'RECEIVE_CONNECTION_FROM_OWL':
      return {
        ...state,
        isRequesting: false,
        isConnected: action.isConnected,
        midiInputs: action.midiInputs,
        midiOutputs: action.midiOutputs,
        connectedMidiInputPort: action.connectedMidiInputPort,
        connectedMidiOutputPort: action.connectedMidiOutputPort,
      }
    case 'SELECT_MIDI_INPUT_PORT_SUCCESS':
      return {
        ...state,
        connectedMidiInputPort: action.connectedMidiInputPort
      }
    case 'SELECT_MIDI_OUTPUT_PORT_SUCCESS':
      return {
        ...state,
        connectedMidiOutputPort: action.connectedMidiOutputPort
      }
    case 'BEGIN_LOAD_PATCH_ON_TO_OWL':
      return {
        ...state,
        patchIsLoading: true,
        patchLoaded : false
      }
    case 'COMPLETE_LOAD_PATCH_ON_TO_OWL':
      return {
        ...state,
        patchIsLoading: false,
        patchLoaded : action.patchLoaded
      }
    case 'STORE_PATCH_ON_DEVICE_REQUEST':
      return {
        ...state,
        patchIsStoring: true,
        patchStoredSuccess: false
      };
    case 'STORE_PATCH_ON_DEVICE_ERROR':
      return {
        ...state,
        patchIsStoring: false,
        patchStoredSuccess: false
      };
    case 'STORE_PATCH_ON_DEVICE_SUCCESS':
      return {
        ...state,
        patchIsStoring: false,
        patchStoredSuccess: true
      };
    case 'DEVICE_PROGRAM_CHANGE':
      return {
        ...state,
        activePresetSlot : action.slot
      }
    case 'CLEAR_PRESET_LIST':
      return {
        ...state,
        presets: [],
        activePresetSlot: null
      }
    case 'CLEAR_RESOURCE_LIST':
      return {
        ...state,
        resources: [],
      }
    case 'DEVICE_PRESET_RECEIVED':
      return {
        ...state,
        presets: [
          ...state.presets.filter(preset => preset.slot !== action.slot),
          { name: action.name, slot: action.slot, size: action.size }
        ]
      };
    case 'DEVICE_RESOURCE_RECEIVED':
      return {
        ...state,
        resources: [
          ...state.resources.filter(resource => resource.slot !== action.slot),
          { name: action.name, slot: action.slot }
        ]
      };
    case 'DEVICE_UUID_RECEIVED':
      return {
        ...state,
        uuid: action.uuid
      };
    case 'OWL_FIRMWARE_VERSION_RECEIVED':
      return {
        ...state,
        firmWareVersion : action.firmWare
      }
    case 'OWL_PATCH_STATUS_RECEIVED':
      return {
        ...state,
        status : action.status
      }
    case 'OWL_PROGRAM_MESSAGE_RECEIVED':
      return {
        ...state,
        programMessage : action.programMessage
      }
    case 'OWL_PROGRAM_ERROR_RECEIVED':
      return {
        ...state,
        programError : action.programError
      }
    default:
      return state;
  }
}

export default owlState;
