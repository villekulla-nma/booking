import { vi, type Mock } from 'vitest';
import {
  createElement,
  useEffect,
  type FC,
  type PropsWithChildren,
} from 'react';
import nock from 'nock';
import { render, screen, act } from '@testing-library/react';
import { Route, Switch } from 'react-router-dom';
import type { Location } from 'history';
import { initializeIcons } from '@uifabric/icons';

import { ResourcePage } from '../resource-page';
import { useMediaQuery } from '../../hooks/use-media-query';
import { scopeIsDone } from '../../helpers/nock';
import { waitFor as customWaitFor } from '../../helpers/wait-for';
import { MemoryRouterShim as Router } from '../../components/router-shim';

// TODO: remove @fullcalendar mocks as soon as the test runner natively supports ESM
vi.mock('@fullcalendar/react', () => {
  const FullCalendarMock = (
    props: Record<string, unknown> & {
      eventSources: Array<{ events: (info: Record<string, unknown>) => void }>;
    }
  ) => {
    useEffect(() => {
      props.eventSources.forEach(({ events: fn }) => {
        fn({
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 3600 * 100),
        });
      });
    }, [props.events]);
    return createElement('div', props);
  };

  return { default: FullCalendarMock };
});
vi.mock('@fullcalendar/core/internal', () => ({
  BASE_OPTION_DEFAULTS: { aspectRatio: 1 },
}));
vi.mock('@fullcalendar/core/locales/de', () => ({ default: { de: '' } }));
vi.mock('@fullcalendar/daygrid');
vi.mock('@fullcalendar/timegrid');
vi.mock('@fullcalendar/interaction');

vi.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

vi.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: vi.fn(),
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

      await customWaitFor(() => pathname !== '', 200);

      expect(pathname).toBe('/login');
      expect(from).toBe(resourcePagePath);
    });
  });

  describe('valid session', () => {
    const resourceId = 'Uj5SAS740';
    const date = new Date(Date.now() + 24 * 3600 * 1000);
    const [tomorrow] = date.toISOString().split('T');
    const [year] = date.toISOString().split('-');
    // Get a valid result in the last week of the year, too...
    const partialEndYear = year.substring(0, 3);
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock('http://localhost')
        .get(`/api/resources/${resourceId}/events`)
        .query(
          ({ start, end, timeZone, ...rest }) =>
            (start as string).startsWith(year) &&
            (end as string).startsWith(partialEndYear) &&
            (timeZone as string).length > 0 &&
            Object.keys(rest).length === 0
        )
        .reply(200, []);
    });

    // TODO: enable again as soon as @fullcalendar isn't mocked anymore
    it.skip('should show a caption on small screens', async () => {
      (useMediaQuery as Mock).mockReturnValue(false);

      render(
        <Router initialEntries={[`/resources/${resourceId}/week/${tomorrow}`]}>
          <Route
            path="/resources/:resourceId/:view/:now"
            component={ResourcePage}
          />
        </Router>
      );

      screen.getByTestId('caption');
      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });
    });

    // TODO: enable again as soon as @fullcalendar isn't mocked anymore
    it.skip('should not show a caption on small screens', async () => {
      (useMediaQuery as Mock).mockReturnValue(true);

      render(
        <Router initialEntries={[`/resources/${resourceId}/week/${tomorrow}`]}>
          <Route
            path="/resources/:resourceId/:view/:now"
            component={ResourcePage}
          />
        </Router>
      );

      expect(screen.queryByTestId('caption')).toBeNull();
      await expect(scopeIsDone(scope)).resolves.toBe(true);
    });
  });
});
