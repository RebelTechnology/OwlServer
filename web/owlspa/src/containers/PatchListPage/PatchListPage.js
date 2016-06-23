import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import Filters from '../Filters/Filters';
import PatchList from '../PatchList/PatchList';

class PatchListPage extends Component {
  render(){
    return (
      <div>
        <Filters />
        <PatchList />
      </div>
    );
  }
}

export default PatchListPage;