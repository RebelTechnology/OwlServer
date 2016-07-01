import React from 'react';
import { Route , IndexRedirect } from 'react-router';
import { App, PatchList }from 'containers';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="patches/latest" />
    <Route path="patches(/:topFilter)(/:subFilter)" component={PatchList} />
  </Route>
);