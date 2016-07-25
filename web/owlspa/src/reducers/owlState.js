import {
  REQUEST_CONNECT_TO_OWL,
  RECEIVE_CONNECTION_FROM_OWL,
  BEGIN_LOAD_PATCH_ON_TO_OWL,
  COMPLETE_LOAD_PATCH_ON_TO_OWL
} from 'constants';

const initialState = {
  isConnected: false,
  isRequesting:false,
  patchIsLoading: false,
  patchLoaded : false
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
    default:
      return state
  }
}

export default owlState;