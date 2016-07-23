import { SET_ACTIVE_DIALOG_TAB } from 'constants';

const setActiveDialogTab = (tabNum) => {
  return {
    type: SET_ACTIVE_DIALOG_TAB,
    tabNum
  };
}

export default setActiveDialogTab;