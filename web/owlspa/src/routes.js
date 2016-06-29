import React from 'react';
import { Route , IndexRedirect } from 'react-router';
import { App, PatchListPage }from 'containers';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="latest" />
    <Route path="latest" component={PatchListPage} />
    <Route path="tags" component={PatchListPage} />
    <Route path="authors" component={PatchListPage} />
    <Route path="all" component={PatchListPage} />
    <Route path="my-patches" component={PatchListPage} />
  </Route>
);