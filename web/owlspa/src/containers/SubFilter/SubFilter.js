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
    const { routeParams } = this.props; 
    if(routeParams && routeParams.subFilter){
      this.props.togglePatchListSubFilter(routeParams.subFilter);
    }
  }
  componentWillReceiveProps(nextProps){
    const { routeParams } = this.props; 
    if(this.props.patchListFilter.topFilter !== nextProps.patchListFilter.topFilter){
      this.props.resetPatchListSubFilter();
    }
    if(routeParams && (routeParams.subFilter !== nextProps.routeParams.subFilter)){
      this.props.resetPatchListSubFilter(nextProps.routeParams.subFilter);
    }
  }

  render(){
    const { authors, tags, patchListFilter: { subFilter, topFilter } } = this.props;
    const tagFilters = this.buildFilters(tags, subFilter);
    const authorFilters = this.buildFilters(authors, subFilter);

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
  routeParams : PropTypes.object
}

export default connect(mapStateToProps, { 
  togglePatchListSubFilter,
  resetPatchListSubFilter,
})(SubFilter);
