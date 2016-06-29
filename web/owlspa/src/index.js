import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import routes from './routes';
import rootReducer from 'reducers';

const browserHistory = useRouterHistory(createHistory)({ basename: '/patch-library-spa' });
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>
), document.getElementById('owl-spa'));