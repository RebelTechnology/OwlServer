import { SET_PATCHLIST_SEARCH_TERM } from 'constants';

const setPatchListSearchTerm = (searchTerm) => {
  return {
    type: SET_PATCHLIST_SEARCH_TERM,
    searchTerm
  };
}

export default setPatchListSearchTerm;