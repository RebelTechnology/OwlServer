const initialState = {
  searchTerm: null
};

const patchListSearch = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PATCHLIST_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.searchTerm || null
      };

    default:
      return state;
  }
}

export default patchListSearch;
