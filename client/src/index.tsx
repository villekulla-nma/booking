import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';

import './main.css';
import { EventPage } from './pages/event-page';
import { ResourcePage } from './pages/resource-page';
import { LoginPage } from './pages/login-page';
import { StartPage } from './pages/start-page';
import { WithAuth } from './components/with-auth';
import { LogoutButton } from './components/logout-button';

const routes: RouteProps[] = [
  {
    path: '/',
    component: StartPage,
    strict: true,
    exact: true,
  },
  {
    path: '/resources/:resourceId',
    component: ResourcePage,
    exact: true,
  },
  {
    path: '/resources/:resourceId/events/:eventId',
    component: EventPage,
  },
];

ReactDOM.render(
  <StrictMode>
    <Router basename="app">
      <WithAuth loginPage={<LoginPage />}>
        <LogoutButton />
        <hr />
        <Switch>
          {routes.map((route, i) => (
            <Route key={i} {...route} />
          ))}
        </Switch>
      </WithAuth>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
