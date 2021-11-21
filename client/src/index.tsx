import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { AdminStartPage } from './pages/admin-start-page';
import { AdminUsersPage } from './pages/admin-users-page';
import { AdminUnitsPage } from './pages/admin-units-page';
import { AdminResourcesPage } from './pages/admin-resources-page';
import { AdminUsersCreatePage } from './pages/admin-users-create-page';
import { ROLE } from './constants';

const authenticatedRoutes: RouteProps[] = [
  {
    path: '/',
    children: () => StartPage,
  },
  {
    path: '/resources/:resourceId/create',
    children: () => ReservationPage,
  },
  ...['/resources/:resourceId', '/resources/:resourceId/:view'].map((path) => ({
    children: () => RedirectToResourcePage,
    path,
  })),
  {
    path: '/resources/:resourceId/:view/:now',
    children: () => ResourcePage,
  },
  {
    path: '/events/:eventId',
    children: () => EventPage,
  },
];

const adminRoutes: RouteProps[] = [
  {
    path: '/admin',
    children: () => AdminStartPage,
  },
  {
    path: '/admin/users',
    children: () => AdminUsersPage,
  },
  {
    path: '/admin/users/create',
    children: () => AdminUsersCreatePage,
  },
  {
    path: '/admin/units',
    children: () => AdminUnitsPage,
  },
  {
    path: '/admin/resources',
    children: () => AdminResourcesPage,
  },
];

const publicRoutes: RouteProps[] = [
  {
    path: '/login',
    children: () => LoginPage,
  },
  {
    path: '/password-reset',
    children: () => PasswordResetPage,
  },
  {
    path: '/password-reset/:token',
    children: () => PasswordUpdatePage,
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
            <Routes>
              {authenticatedRoutes.map((route, i) => (
                <PrivateRoute key={i} {...route} />
              ))}
              {adminRoutes.map((route, i) => (
                <PrivateRoute key={i} role={ROLE.ADMIN} {...route} />
              ))}
              {publicRoutes.map((route, i) => (
                <Route key={i} {...route} />
              ))}
              <Route path="*" children={NotFoundPage} />
            </Routes>
          </FabricBase>
        </UserProvider>
      </ErrorBoundary>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
