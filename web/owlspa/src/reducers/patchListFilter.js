const initialState = {
  topFilter: 'all',
  subFilter: []
};

const addOrRemoveFromArray = (currArr, newItem) => {
  if(currArr.indexOf(newItem) === -1){
    return [
      ...currArr,
      newItem
    ]
  }
  return currArr.filter(item => item !== newItem);
}

const patchListFilter = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PATCHLIST_TOP_FILTER':
      return {
        ...state,
        topFilter: action.topFilter
      };
    case 'TOGGLE_FILTER_IN_SUB_FILTER':
      return {
        ...state,
        subFilter: addOrRemoveFromArray(state.subFilter, action.subFilter)
      };
    case 'RESET_PATCHLIST_SUB_FILTER':
      return {
        ...state,
        subFilter: action.subFilter ? [action.subFilter] : initialState.subFilter
      };
    default:
      return state;
  }
}

export default patchListFilter;
