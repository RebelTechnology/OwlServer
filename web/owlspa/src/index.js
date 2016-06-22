import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHistory, useBasename } from 'history';
import routes from './routes';

const history = useRouterHistory(useBasename(createHistory))({
  basename: "/patch-library-spa"
});

ReactDOM.render((
  <Router history={history} routes={routes} />
), document.getElementById('owl-spa'));