const togglePatchListSubFilter = (subFilter) => {
  return {
    type: 'TOGGLE_FILTER_IN_SUB_FILTER',
    subFilter
  };
}

export default togglePatchListSubFilter;
