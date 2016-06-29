import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { Filters , PatchList } from 'containers';

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