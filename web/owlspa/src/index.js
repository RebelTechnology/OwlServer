import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import customHistory from './customHistory';
import routes from './routes';
import rootReducer from 'reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

ReactDOM.render((
  <Provider store={store}>
    <Router history={customHistory} routes={routes} />
  </Provider>
), document.getElementById('owl-spa'));