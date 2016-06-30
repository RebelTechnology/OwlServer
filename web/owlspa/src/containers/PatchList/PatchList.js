import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchPatches,
  setPatchListTopFilter,
  fetchAuthors,
  fetchTags,
  resetPatchListSubFilter
} from 'actions';
import { Patch , PatchCounter, SubFilter } from 'containers';

class PatchList extends Component {
  componentWillMount(){
    this.props.fetchPatches();
    this.props.fetchAuthors();
    this.props.fetchTags();
    this.props.setPatchListTopFilter(this.props.route.path);
  }
  componentWillReceiveProps(nextProps){
    const nextFilter = nextProps.route.path
    if(nextFilter !== this.props.route.path){
      this.props.resetPatchListSubFilter();
      this.props.setPatchListTopFilter(nextFilter);
    }
  }
  getFilteredSortedPatches(patches, patchListFilter){
    switch(patchListFilter.topFilter){
      case 'latest':
        return patches.filter(patch => patch.published).sort((a,b) => b.creationTimeUtc - a.creationTimeUtc);
      case 'all':
        return patches.filter(patch => patch.published).sort((a,b) => (a.name).localeCompare(b.name));
      case 'authors':
        return patches.filter(patch => patch.published);
      case 'tags':
        return patches.filter(patch => patch.published);
      case 'my-patches':
        return patches.filter(patch => patch.published);
      default:
        return patches.filter(patch => patch.published);
    }
  }
  render(){
    const { patches, patchListFilter, patchListFilter:{topFilter} } = this.props;
    const filteredPatches = this.getFilteredSortedPatches(patches.items, patchListFilter);
    return (
      <div>
        {(topFilter === 'authors' || topFilter === 'tags') ? <SubFilter parentFilter={topFilter} /> : null}
        <div className="wrapper flexbox">
          <div className="content-container">
            <PatchCounter />
              { filteredPatches.map(
                patch => {
                  return (
                    <Patch 
                      key={patch._id}
                      id={patch._id}
                      name={patch.name}
                      published={patch.published}
                      authorName={patch.author.name}
                      description={patch.description}
                      tags={patch.tags}
                    />
                  );
                })}
          </div>
        </div>
      </div>
    );
  }
}

PatchList.PropTypes = {
  patches : PropTypes.array,
  filter: PropTypes.string
};

function mapStateToProps({ patches, patchListFilter }){
  return {
    patches,
    patchListFilter
  }
}

export default connect(mapStateToProps, {
  fetchPatches, 
  setPatchListTopFilter,
  fetchAuthors, 
  fetchTags,
  resetPatchListSubFilter
})(PatchList);
