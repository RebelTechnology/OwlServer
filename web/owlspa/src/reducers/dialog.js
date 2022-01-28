const initialState = {
  isOpen: false,
  isError: false,
  header: '',
  activeDialogTab: 0,
  tabs: []
};

const dialog = (state = initialState, action) => {
  switch (action.type) {
  case 'NEW_DIALOG':
    return {
      ...initialState,
      isOpen: true,
      ...action.dialog
    };

  case 'SET_ACTIVE_DIALOG_TAB':
    return {
      ...state,
      activeDialogTab: action.tabNum
    };

  case 'CLOSE_DIALOG':
    return initialState;

  default:
    return state;
  }
}

export default dialog;
