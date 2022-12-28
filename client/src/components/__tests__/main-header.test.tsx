import nock from 'nock';
import { Route, Switch } from 'react-router-dom';
import type { Location } from 'history';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import { initializeIcons } from '@uifabric/icons';

import { MainHeader } from '../main-header';
import { sleep } from '../../helpers/sleep';
import { reload } from '../../helpers/location';
import { useMediaQuery } from '../../hooks/use-media-query';
import { useUserContext } from '../../hooks/use-user-context';
import { scopeIsDone } from '../../helpers/nock';
import { waitFor as customWaitFor } from '../../helpers/wait-for';
import { MemoryRouterShim as Router } from '../router-shim';

jest.mock('../../hooks/use-user-context');

jest.mock('../../helpers/location', () => ({
  reload: jest.fn(),
}));

jest.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(),
}));

describe('Main-Header', () => {
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
      (useUserContext as jest.Mock).mockReturnValue(user);

      const currentPagePath = '/';
      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(401, { status: 'error' });
      let pathname = '';
      let from: string | undefined;

      render(
        <Router initialEntries={[currentPagePath]}>
          <Switch>
            <Route path="/" exact={true} component={MainHeader} />
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

      await act(async () => {
        await customWaitFor(() => pathname !== '', 200);
      });

      expect(pathname).toBe('/login');
      expect(from).toBe(currentPagePath);
    });
  });

  describe('logged-in', () => {
    it('should display resource (Desktop)', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, {
          status: 'ok',
          payload: [
            {
              id: 'Uj5SAS740',
              name: 'Resource #1',
            },
            {
              id: 'gWH5T7Kdz',
              name: 'Resource #2',
            },
          ],
        });

      render(<MainHeader />, {
        wrapper: ({ children: c }) => <Router>{c}</Router>,
      });

      await screen.findByText('Resource #1');
      screen.getByText('Resource #2');

      expect(screen.queryByTestId('admin-link')).toBeNull();
      expect(scope.isDone()).toBe(true);
    });

    it('should display resource (Mobile)', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, {
          status: 'ok',
          payload: [
            {
              id: 'Uj5SAS740',
              name: 'Resource #1',
            },
            {
              id: 'gWH5T7Kdz',
              name: 'Resource #2',
            },
          ],
        });

      render(<MainHeader />, {
        wrapper: ({ children: c }) => <Router>{c}</Router>,
      });

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      const menuButton = await waitFor(
        () => screen.getByTitle('Menü einblenden') as Element
      );

      expect(screen.queryByText('Resource #2')).toBeNull();

      fireEvent.click(menuButton);

      screen.getByText('Resource #1');
      screen.getByText('Resource #2');
    });

    it('should log out the user', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, { status: 'ok', payload: [] })
        .post('/api/logout')
        .reply(200);
      let pathname = '';
      let state: unknown;

      render(
        <Router initialEntries={['/some/page']}>
          <Switch>
            <Route path="/some/page" exact={true} component={MainHeader} />
            <Route
              path="*"
              render={({ location }) => {
                pathname = location.pathname;
                state = location.state;
                return null;
              }}
            />
          </Switch>
        </Router>
      );

      const logoutButtonWrapper = await screen.findByText('Abmelden');
      // eslint-disable-next-line testing-library/no-node-access
      const logoutButton = logoutButtonWrapper.closest(
        'button'
      ) as HTMLButtonElement;

      fireEvent.click(logoutButton);

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      expect(pathname).toBe('/');
      expect(state).toStrictEqual({});
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('admin user', () => {
    it('should display a link to the admin area', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);
      (useUserContext as jest.Mock).mockReturnValue({ ...user, role: 'admin' });

      const scope = nock('http://localhost').get('/api/resources').reply(200, {
        status: 'ok',
        payload: [],
      });

      render(<MainHeader />, {
        wrapper: ({ children: c }) => <Router>{c}</Router>,
      });

      const link = await waitFor(
        () => screen.getByTestId('admin-link') as HTMLAnchorElement | null
      );

      expect(link?.href).toMatch(/\/admin$/);
      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });
    });
  });

  describe('logged-out', () => {
    it('should not display the logout button', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (useUserContext as jest.Mock).mockReturnValue(null);

      render(<MainHeader />, {
        wrapper: ({ children: c }) => <Router>{c}</Router>,
      });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByText('Abmelden')).toBeNull();
    });

    it('should not display the hamburger when there are no resources', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);
      (useUserContext as jest.Mock).mockReturnValue(null);

      render(<MainHeader />, {
        wrapper: ({ children: c }) => <Router>{c}</Router>,
      });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByTitle('Menü einblenden')).toBeNull();
    });
  });
});
