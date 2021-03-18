import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';

import './main.css';
import { EventPage } from './pages/event-page';
import { ResourcePage } from './pages/resource-page';
import { LoginPage } from './pages/login-page';
import { StartPage } from './pages/start-page';
import { RequestPasswordResetPage } from './pages/request-password-reset-page';
import { ExecutePasswordResetPage } from './pages/execute-password-reset-page';
import { PrivateRoute } from './components/private-route';
import { LogoutButton } from './components/logout-button';

const authenticatedRoutes: RouteProps[] = [
  {
    path: '/',
    component: StartPage,
    strict: true,
    exact: true,
  },
  {
    path: '/resources/:resourceId',
    component: ResourcePage,
    strict: true,
    exact: true,
  },
  {
    path: '/resources/:resourceId/events/:eventId',
    component: EventPage,
    strict: true,
  },
];

const publicRoutes: RouteProps[] = [
  {
    path: '/login',
    component: LoginPage,
    strict: true,
    exact: true,
  },
  {
    path: '/password-reset',
    component: RequestPasswordResetPage,
    strict: true,
    exact: true,
  },
  {
    path: '/password-reset/:token',
    component: ExecutePasswordResetPage,
    strict: true,
    exact: true,
  },
];

ReactDOM.render(
  <StrictMode>
    <Router basename="app">
      <LogoutButton />
      <hr />
      <Switch>
        {authenticatedRoutes.map((route, i) => (
          <PrivateRoute key={i} {...route} />
        ))}
        {publicRoutes.map((route, i) => (
          <Route key={i} {...route} />
        ))}
      </Switch>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
