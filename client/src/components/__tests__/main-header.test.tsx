import nock from 'nock';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
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

      await expect(scopeIsDone(scope)).resolves.toBe(true);

      await customWaitFor(() => pathname !== '', 200);

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
        .reply(200, [
          {
            id: 'Uj5SAS740',
            name: 'Resource #1',
          },
          {
            id: 'gWH5T7Kdz',
            name: 'Resource #2',
          },
        ]);

      render(<MainHeader />, { wrapper: Router });

      await waitFor(() => screen.getByText('Resource #1'));
      screen.getByText('Resource #2');

      expect(scope.isDone()).toBe(true);
    });

    it('should display resource (Mobile)', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, [
          {
            id: 'Uj5SAS740',
            name: 'Resource #1',
          },
          {
            id: 'gWH5T7Kdz',
            name: 'Resource #2',
          },
        ]);

      render(<MainHeader />, { wrapper: Router });

      expect(screen.queryByText('Resource #2')).toBeNull();

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      fireEvent.click(screen.getByTitle('Menü einblenden'));

      screen.getByText('Resource #1');
      screen.getByText('Resource #2');
    });

    it('should log out the user', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, [])
        .post('/api/logout')
        .reply(200);

      render(<MainHeader />, { wrapper: Router });

      const logoutButton = await waitFor(
        () =>
          screen.getByText('Abmelden').closest('button') as HTMLButtonElement
      );

      fireEvent.click(logoutButton);

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      expect(reload).toHaveBeenCalled();
    });
  });

  describe('logged-out', () => {
    it('should not display the logout button', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (useUserContext as jest.Mock).mockReturnValue(null);

      render(<MainHeader />, { wrapper: Router });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByText('Abmelden')).toBeNull();
    });

    it('should not display the hamburger when there are no resources', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);
      (useUserContext as jest.Mock).mockReturnValue(null);

      render(<MainHeader />, { wrapper: Router });

      await act(async () => {
        await sleep(100);
      });

      expect(screen.queryByTitle('Menü einblenden')).toBeNull();
    });
  });
});
