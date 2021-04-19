import type { FC } from 'react';
import nock from 'nock';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import type { Location } from 'history';
import { initializeIcons } from '@uifabric/icons';

import { ResourcePage } from '../resource-page';
import { useMediaQuery } from '../../hooks/use-media-query';
import { scopeIsDone } from '../../helpers/nock';

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(),
}));

describe('Resource Page', () => {
  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('invalid session', () => {
    let warn: typeof console.warn;
    let error: typeof console.error;

    beforeAll(() => {
      warn = console.warn;
      error = console.error;
      console.warn = () => undefined;
      console.error = () => undefined;
    });

    afterAll(() => {
      console.warn = warn;
      console.error = error;
    });

    it('should redirect to the login page', async () => {
      const resourceId = 'Uj5SAS740';
      const date = new Date(Date.now() + 24 * 3600 * 1000);
      const [tomorrow] = date.toISOString().split('T');
      const resourcePagePath = `/resources/${resourceId}/week/${tomorrow}`;
      const scope = nock('http://localhost')
        .get(`/api/resources/${resourceId}/events`)
        .query(() => true)
        .reply(401, { status: 'error' });
      let pathname = '';
      let from: string | undefined;

      render(
        <Router initialEntries={[resourcePagePath]}>
          <Switch>
            <Route
              path="/resources/:resourceId/:view/:now"
              exact={true}
              component={ResourcePage}
            />
            <Route
              path="*"
              render={({ location }) => {
                pathname = location.pathname;
                from = (location as Location<{ from?: string }>).state.from;
                return null;
              }}
            />
          </Switch>
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });
      expect(pathname).toBe('/login');
      expect(from).toBe(resourcePagePath);
    });
  });

  describe('valid session', () => {
    it('should render the calendar somehow...', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);

      const resourceId = 'Uj5SAS740';
      const date = new Date(Date.now() + 24 * 3600 * 1000);
      const [tomorrow] = date.toISOString().split('T');
      const [year] = date.toISOString().split('-');
      const scope = nock('http://localhost')
        .get(`/api/resources/${resourceId}/events`)
        .query(
          ({ start, end, timeZone, ...rest }) =>
            (start as string).startsWith(year) &&
            (end as string).startsWith(year) &&
            (timeZone as string).length > 0 &&
            Object.keys(rest).length === 0
        )
        .reply(200, []);

      render(
        <Router initialEntries={[`/resources/${resourceId}/week/${tomorrow}`]}>
          <Route
            path="/resources/:resourceId/:view/:now"
            component={ResourcePage}
          />
        </Router>
      );
      screen.getByText('Reservieren').closest('button') as HTMLButtonElement;

      await expect(scopeIsDone(scope)).resolves.toBe(true);
    });
  });
});
