import {
  REQUEST_CONNECT_TO_OWL,
  RECEIVE_CONNECTION_FROM_OWL,
  BEGIN_LOAD_PATCH_ON_TO_OWL,
  COMPLETE_LOAD_PATCH_ON_TO_OWL,
  OWL_PRESET_CHANGE,
  OWL_FIRMWARE_VERSION_RECEIVED,
  OWL_PATCH_STATUS_RECEIVED,
  OWL_PROGRAM_MESSAGE_RECEIVED
} from 'constants';

const initialState = {
  isConnected: false,
  isRequesting:false,
  patchIsLoading: false,
  patchLoaded : false,
  loadedPatchName: null,
  firmWareVersion: null,
  status: null,
  programMessage:null
};

const owlState = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_CONNECT_TO_OWL:
      return {
        ...state,
        isRequesting: true,
        isConnected: false
      }
    case RECEIVE_CONNECTION_FROM_OWL:
      return {
        ...state,
        isRequesting: false,
        isConnected: action.isConnected
      }
    case BEGIN_LOAD_PATCH_ON_TO_OWL:
      return {
        ...state,
        patchIsLoading: true,
        patchLoaded : false
      }
    case COMPLETE_LOAD_PATCH_ON_TO_OWL:
      return {
        ...state,
        patchIsLoading: false,
        patchLoaded : action.patchLoaded
      }
    case OWL_PRESET_CHANGE:
      return {
        ...state,
        loadedPatchName : action.name
      }
    case OWL_FIRMWARE_VERSION_RECEIVED:
      return {
        ...state,
        firmWareVersion : action.firmWare
      }
    case OWL_PATCH_STATUS_RECEIVED:
      return {
        ...state,
        status : action.status
      }
    case OWL_PROGRAM_MESSAGE_RECEIVED:
      return {
        ...state,
        programMessage : action.programMessage
      }
    default:
      return state
  }
}

export default owlState;