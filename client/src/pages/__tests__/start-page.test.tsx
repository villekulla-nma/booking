import { vi, type Mock } from 'vitest';
import type { FC, PropsWithChildren } from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { Route, Switch } from 'react-router-dom';
import type { Location } from 'history';
import { initializeIcons } from '@uifabric/icons';

import { StartPage } from '../start-page';
import { useUserContext } from '../../hooks/use-user-context';
import { scopeIsDone } from '../../helpers/nock';
import { waitFor as customWaitFor } from '../../helpers/wait-for';
import { MemoryRouterShim as Router } from '../../components/router-shim';

vi.mock('../../hooks/use-user-context');

vi.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

describe('Start Page', () => {
  const user = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    role: 'user',
  };

  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('invalid session', () => {
    it('should redirect to the login page', async () => {
      (useUserContext as Mock).mockReturnValue(user);

      let pathname = '';
      let from: string | undefined;

      const scope = nock('http://localhost')
        .get('/api/user/events')
        .query({ limit: 10 })
        .reply(401, { status: 'error' });

      render(
        <Router initialEntries={['/']}>
          <Switch>
            <Route path="/" exact={true} component={StartPage} />
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

      await expect(scopeIsDone(scope)).resolves.toBe(true);
      await customWaitFor(() => pathname !== '', 200);
      expect(pathname).toBe('/login');
      expect(from).toBe('/');
    });
  });

  describe('No upcoming events', () => {
    it('should not display any events', async () => {
      (useUserContext as Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/user/events')
        .query({ limit: 10 })
        .reply(200, { payload: [] });

      render(
        <Router>
          <StartPage />
        </Router>
      );

      await screen.findByText('Es stehen keine Buchungen an.');

      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Some upcoming events', () => {
    it('should display events', async () => {
      (useUserContext as Mock).mockReturnValue(user);

      const [today] = new Date().toISOString().split('T');
      const scope = nock('http://localhost')
        .get('/api/user/events')
        .query({ limit: 10 })
        .reply(200, {
          payload: [
            {
              id: 'SHYVTIGoM',
              start: `${today}T09:00:00.000Z`,
              end: `${today}T10:00:00.000Z`,
              description: 'Thingies...',
              allDay: false,
              resource: 'Resource #1',
            },
          ],
        });

      render(
        <Router>
          <StartPage />
        </Router>
      );

      const link = await screen.findByText('Resource #1');

      screen.getByText('Thingies...');

      expect(link).toBeInstanceOf(HTMLAnchorElement);
      expect((link as HTMLAnchorElement).href).toContain('/events/SHYVTIGoM');
      expect(scope.isDone()).toBe(true);
    });
  });
});
