import { TOGGLE_FILTER_IN_SUB_FILTER } from 'constants';

const togglePatchListSubFilter = (subFilter) => {
  return {
    type: TOGGLE_FILTER_IN_SUB_FILTER,
    subFilter
  };
}

export default togglePatchListSubFilter;