import React from 'react';
import { Route , IndexRedirect } from 'react-router';
import { App, PatchListPage, PatchDetailsPage, CreatePatchPage }from 'containers';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="patches/latest" />
    <Route path="patches(/:topFilter)(/:subFilter)" component={PatchListPage} />
    <Route path="patch(/:patchSeoName)" component={PatchDetailsPage} />
    <Route path="create-patch" component={CreatePatchPage} />
  </Route>
);