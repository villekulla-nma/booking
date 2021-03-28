import { render } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';

import { RedirectToResourcePage } from '../redirect-to-resource-page';

describe('Redirect-toResource Page', () => {
  it('should redirect to the default view', async () => {
    const resourceId = 'Uj5SAS740';
    const [today] = new Date().toISOString().split('T');
    let pathname = `/resources/${resourceId}`;

    render(
      <Router initialEntries={[pathname]}>
        <Route
          path="/resources/:resourceId"
          component={RedirectToResourcePage}
        />
        <Route
          path="*"
          render={({ location }) => {
            pathname = location.pathname;
            return null;
          }}
        />
      </Router>
    );

    expect(pathname).toBe(`/resources/${resourceId}/week/${today}`);
  });

  it('should respect the given view', async () => {
    const resourceId = 'Uj5SAS740';
    const [today] = new Date().toISOString().split('T');
    let pathname = `/resources/${resourceId}/month`;

    render(
      <Router initialEntries={[pathname]}>
        <Route
          path="/resources/:resourceId/:view"
          component={RedirectToResourcePage}
        />
        <Route
          path="*"
          render={({ location }) => {
            pathname = location.pathname;
            return null;
          }}
        />
      </Router>
    );

    expect(pathname).toBe(`/resources/${resourceId}/month/${today}`);
  });
});
