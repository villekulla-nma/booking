import { render } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { AdminStartPage } from '../admin-start-page';
import { MemoryRouterShim as Router } from '../../components/router-shim';

describe('Admin Start Page', () => {
  initializeIcons();

  it('should redirect to the admin users page', async () => {
    let pathname = '/admin';

    render(
      <Router initialEntries={[pathname]}>
        <Route path="/admin" component={AdminStartPage} />
        <Route
          path="*"
          render={({ location }) => {
            pathname = location.pathname;
            return null;
          }}
        />
      </Router>
    );

    expect(pathname).toBe('/admin/users');
  });
});
