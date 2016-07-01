import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { SubFilterButton } from 'components';
import { 
  togglePatchListSubFilter,
  resetPatchListSubFilter } from 'actions';

class SubFilter extends Component {
  handleSubFilterClick(e,filter){
    this.props.togglePatchListSubFilter(filter);
  }
  handleAllSubFilterClick(e){
    this.props.resetPatchListSubFilter();
  }
  buildFilters({items}, subFilter){
    return items.map( item => {
      let filterName = item.name || item;
      return (
        <SubFilterButton 
          isActive={subFilter.indexOf(filterName) > -1} 
          onClick={(e) => this.handleSubFilterClick(e,filterName)} 
          key={filterName}>
          {filterName}
        </SubFilterButton>
      );
    });
  }
  componentWillMount(){
    if(this.props.subFilter){
      this.props.togglePatchListSubFilter(this.props.subFilter);
    }
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.subFilter && this.props.subFilter){
      this.props.togglePatchListSubFilter(this.props.subFilter);
    }
    if(this.props.topFilter !== nextProps.topFilter){
      this.props.resetPatchListSubFilter();
    }
  }

  render(){
    const { authors, tags, patchListFilter: { subFilter }, topFilter } = this.props;
    const tagFilters = this.buildFilters(tags, subFilter);
    const authorFilters = this.buildFilters(authors, subFilter);

    console.log(subFilter);
    return (
      <div id="filter-bar">
        <div id="filter-wrapper" className="wrapper">
          <SubFilterButton 
            onClick={(e) => this.handleAllSubFilterClick(e)} 
            isActive={subFilter.length === 0} 
            key="All">All</SubFilterButton>
          { (topFilter === 'authors') && authorFilters }
          { (topFilter === 'tags') && tagFilters }
        </div>
      </div>
    );
  }
  componentWillUnmount(){
    this.props.resetPatchListSubFilter();
  }
}

function mapStateToProps({ patchListFilter, authors, tags }){
  return {
    patchListFilter,
    authors,
    tags
  }
}

SubFilter.propTypes = {
  topFilter : PropTypes.string.isRequired,
  filter : PropTypes.string
}

export default connect(mapStateToProps, { 
  togglePatchListSubFilter,
  resetPatchListSubFilter,
})(SubFilter);
