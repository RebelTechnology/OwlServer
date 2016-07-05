import React from 'react';
import { Route , IndexRedirect } from 'react-router';
import { App, PatchList, PatchDetailsPage }from 'containers';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="patches/latest" />
    <Route path="patches(/:topFilter)(/:subFilter)" component={PatchList} />
    <Route path="patch(/:patchSeoName)" component={PatchDetailsPage} />
  </Route>
);