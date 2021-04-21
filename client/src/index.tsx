import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';
import { FabricBase, loadTheme } from '@fluentui/react';

import './main.css';
import { ErrorBoundary } from './components/error-boundary';
import { EventPage } from './pages/event-page';
import { RedirectToResourcePage } from './pages/redirect-to-resource-page';
import { ResourcePage } from './pages/resource-page';
import { ReservationPage } from './pages/reservation-page';
import { LoginPage } from './pages/login-page';
import { StartPage } from './pages/start-page';
import { PasswordResetPage } from './pages/password-reset-page';
import { PasswordUpdatePage } from './pages/password-update-page';
import { PrivateRoute } from './components/private-route';
import { UserProvider } from './components/user-provider';
import { NotFoundPage } from './pages/not-found-page';

const authenticatedRoutes: RouteProps[] = [
  {
    path: '/',
    component: StartPage,
    strict: true,
    exact: true,
  },
  {
    path: '/resources/:resourceId/create',
    component: ReservationPage,
    strict: true,
    exact: true,
  },
  {
    path: ['/resources/:resourceId', '/resources/:resourceId/:view'],
    component: RedirectToResourcePage,
    strict: true,
    exact: true,
  },
  {
    path: '/resources/:resourceId/:view/:now',
    component: ResourcePage,
    strict: true,
    exact: true,
  },
  {
    path: '/events/:eventId',
    component: EventPage,
    strict: true,
    exact: true,
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
    component: PasswordResetPage,
    strict: true,
    exact: true,
  },
  {
    path: '/password-reset/:token',
    component: PasswordUpdatePage,
    strict: true,
    exact: true,
  },
];

initializeIcons();

const theme = loadTheme({
  defaultFontStyle: { fontFamily: 'sans-serif', fontWeight: 'regular' },
  fonts: {
    small: {
      fontSize: '12px',
    },
    medium: {
      fontSize: '16px',
    },
  },
});

ReactDOM.render(
  <StrictMode>
    <Router basename="app">
      <ErrorBoundary>
        <UserProvider>
          <FabricBase theme={theme}>
            <Switch>
              {authenticatedRoutes.map((route, i) => (
                <PrivateRoute key={i} {...route} />
              ))}
              {publicRoutes.map((route, i) => (
                <Route key={i} {...route} />
              ))}
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </FabricBase>
        </UserProvider>
      </ErrorBoundary>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
