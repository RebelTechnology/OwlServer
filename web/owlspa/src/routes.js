import React from 'react';
import { Route , IndexRedirect } from 'react-router';
import { App, PatchList }from 'containers';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="latest" />
    <Route path="latest" component={PatchList} />
    <Route path="tags" component={PatchList} />
    <Route path="authors" component={PatchList} />
    <Route path="all" component={PatchList} />
    <Route path="my-patches" component={PatchList} />
  </Route>
);