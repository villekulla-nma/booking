import nock from 'nock';
import { MemoryRouter as Router } from 'react-router-dom';
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

jest.mock('../../components/private-route.tsx', () => ({
  PrivateRoute: ({ component: Comp }) => {
    const user = {
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
    };
    const { UserContext } = jest.requireActual('../../contexts/user-context');

    return (
      <UserContext value={user}>
        <Comp />
      </UserContext>
    );
  },
}));

jest.mock('../../components/layout.tsx', () => ({
  Layout: ({ children }) => <>{children}</>,
}));

jest.mock('../../helpers/location', () => ({
  reload: jest.fn(),
}));

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

  describe(`logged-in`, () => {
    it('should display resource', async () => {
      const scope = nock('http://localhost')
        .get('/api/user')
        .times(2)
        .reply(200, { user })
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

    it('should log out the user', async () => {
      const scope = nock('http://localhost')
        .get('/api/user')
        .times(2)
        .reply(200, { user })
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
        await sleep(50);
      });

      expect(reload).toHaveBeenCalled();
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('logged-out', () => {
    it('should not display the logout button', async () => {
      const scope = nock('http://localhost')
        .get('/api/user')
        .times(2)
        .reply(401, { status: 'error' });

      render(<MainHeader />, { wrapper: Router });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByText('Abmelden')).toBeNull();
      expect(scope.isDone()).toBe(true);
    });
  });
});
