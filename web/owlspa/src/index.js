import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

import customHistory from './customHistory';
import routes from './routes';
import reducers from './reducers';

const store = createStore(reducers, composeWithDevTools(
  applyMiddleware(thunk),
));

ReactDOM.render((
  <Provider store={store}>
    <Router history={customHistory} routes={routes} />
  </Provider>
), document.getElementById('owl-spa'));

export const dispatch = store.dispatch; // to allow non react lib files like owlCmd to be able to dispatch actions.
