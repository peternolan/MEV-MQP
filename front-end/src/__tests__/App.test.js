import React from 'react';
import ReactDOM from 'react-dom';


import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import createHistory from 'history/createBrowserHistory';
import { Route } from 'react-router';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage/session';

import reducers from '../reducers/index';
import App from '../components/visualization/App';
import Login from '../components/portal/Login';
import About from '../components/portal/About';
import Help from '../components/portal/Help';
import Dashboard from '../components/portal/Dashboard';
import ReportList from '../components/reports/ReportList';
import NarrativeAnnotator from '../components/editor/NarrativeAnnotator';
import TopNavigation from '../components/TopNavigation';
import CaseSummary from '../components/cases/CaseSummary';

import '../index.css';

const history = createHistory();

const config = {
  key: 'root',
  storage,
};

const rootReducer = persistCombineReducers(config, {
  ...reducers,
  router: routerReducer,
});

const middleware = applyMiddleware(
  routerMiddleware(history),
  thunk,
);

const store = createStore(
  rootReducer,
  middleware,
);

const persistor = persistStore(store);

it('renders without crashing', () => {
  //const div = document.createElement('div');

ReactDOM.render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div class="page">
          {/* <TopNavigation showFilters={test}/> */}
          <Route exact path="/" render={(props) => {
              return (<Login { ...props } />);
            }}
          />
          <Route path="/visualization" render={(props) => {
              mount(<App { ...props } />, document.createElement('div'));
              return (<App { ...props } />);
            }}
          />
          <Route path="/report" render={(props) => {
              return (<ReportList { ...props } />);
            }}
          />
          <Route path="/help" render={(props) => {
              return (<Help { ...props } />);
            }}
          />
          <Route path="/about" render={(props) => {
              return (<About { ...props } />);
            }}
          />
          <Route path="/dashboard" render={(props) => {
              return (<Dashboard { ...props } />);
            }}
          />
          <Route path="/pdf/:id?" render={(props) => {
              return (<NarrativeAnnotator { ...props } />);
            }}
          />
          <Route path="/case/:id?" render={(props) => {
          	  mount(<CaseSummary { ...props } />, document.createElement('div'));
              return (<CaseSummary { ...props } />);
            }}
          />
        </div>
      </ConnectedRouter>
    </Provider>
  </PersistGate>,
  document.getElementById('root') || document.createElement('div') // for testing purposes
);

});
