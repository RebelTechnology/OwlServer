import React from 'react';
import { Route , IndexRoute } from 'react-router';
import App from './containers/App';
import PatchList from './containers/PatchList';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={PatchList} />
    <Route path="latest" component={PatchList} />
    <Route path="tags" component={PatchList} />
    <Route path="authors" component={PatchList} />
    <Route path="all" component={PatchList} />
    <Route path="my-patches" component={PatchList} />
  </Route>
);