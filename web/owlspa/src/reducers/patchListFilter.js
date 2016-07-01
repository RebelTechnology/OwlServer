import { 
  SET_PATCHLIST_TOP_FILTER,
  TOGGLE_FILTER_IN_SUB_FILTER,
  RESET_PATCHLIST_SUB_FILTER
} from 'constants';

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
    case SET_PATCHLIST_TOP_FILTER:
      return Object.assign({}, state, {
        topFilter: action.topFilter
      });
    case TOGGLE_FILTER_IN_SUB_FILTER:
      return Object.assign({}, state, {
        subFilter: addOrRemoveFromArray(state.subFilter, action.subFilter)
      });
    case RESET_PATCHLIST_SUB_FILTER:
      return Object.assign({}, state, {
        subFilter: initialState.subFilter
      });
    default:
      return state
  }
}

export default patchListFilter;