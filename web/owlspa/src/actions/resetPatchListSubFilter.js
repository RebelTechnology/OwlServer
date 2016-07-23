import { RESET_PATCHLIST_SUB_FILTER } from 'constants';

const resetPatchListSubFilter = (subFilter) => {
  return {
    type: RESET_PATCHLIST_SUB_FILTER,
    subFilter
  };
}

export default resetPatchListSubFilter;