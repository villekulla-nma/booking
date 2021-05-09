import type { FC } from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { render, screen, act, fireEvent } from '@testing-library/react';
import nock from 'nock';
import { initializeIcons } from '@uifabric/icons';

import { scopeIsDone } from '../../helpers/nock';
import { useUserContext } from '../../hooks/use-user-context';
import { AdminUsersCreatePage } from '../admin-users-create-page';
import { sleep } from '../../helpers/sleep';

jest.mock('../../hooks/use-user-context');

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../components/admin-layout.tsx', () => {
  const AdminLayout: FC = ({ children }) => <>{children}</>;
  return { AdminLayout };
});

describe('Admin Users Create Page', () => {
  const groups = [
    {
      id: 'Uj5SAS740',
      name: 'Group #1',
    },
    {
      id: 'gWH5T7Kdz',
      name: 'Group #2',
    },
  ];
  const user = {
    id: 'Ul2Zrv1BX',
    email: 'person.two@example.com',
    firstName: 'Person2',
    lastName: 'Two',
    fullName: 'Person2 Two',
    role: 'admin',
    groupId: 'gWH5T7Kdz',
  };
  const newUser = {
    email: 'person.three@example.com',
    firstName: 'Person3',
    lastName: 'Three',
    fullName: 'Person3 Three',
    role: 'user',
    groupId: 'Uj5SAS740',
  };

  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('aborting creation', () => {
    it('should navigate back to users page', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      let pathname = '';
      const scope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups });

      render(
        <Router initialEntries={['/admin/users/create']}>
          <Switch>
            <Route
              path="/admin/users/create"
              exact={true}
              component={AdminUsersCreatePage}
            />
            <Route
              path="*"
              render={({ location }) => {
                pathname = location.pathname;
                return null;
              }}
            />
          </Switch>
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });
      await sleep(50);

      expect(screen.queryByText(/Lade Gruppen/)).toBeNull();

      act(() => {
        fireEvent.click(screen.getByText('Abbrechen'));
      });

      expect(pathname).toBe('/admin/users');
    });
  });

  describe('adding a user', () => {
    it('should create a new user', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      let pathname = '';
      const initialScope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups });
      const creationScope = nock('http://localhost')
        .put('/api/user', {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          groupId: 'Uj5SAS740',
        })
        .reply(200, { status: 'ok' });

      render(
        <Router initialEntries={['/admin/users/create']}>
          <Switch>
            <Route
              path="/admin/users/create"
              exact={true}
              component={AdminUsersCreatePage}
            />
            <Route
              path="*"
              render={({ location }) => {
                pathname = location.pathname;
                return null;
              }}
            />
          </Switch>
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByText(/Lade Gruppen/)).toBeNull();

      fireEvent.change(screen.getByLabelText('Vorname'), {
        target: { value: newUser.firstName },
      });
      fireEvent.change(screen.getByLabelText('Nachname'), {
        target: { value: newUser.lastName },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: newUser.email },
      });

      const roleSelect = screen.getByTestId('role-select');
      fireEvent.click(roleSelect);
      fireEvent.click(
        screen.getByText('User', {
          selector: 'span',
        })
      );

      const groupSelect = screen.getByTestId('group-select');
      fireEvent.click(groupSelect);
      fireEvent.click(
        screen.getByText('Group #1', {
          selector: 'span',
        })
      );

      fireEvent.click(
        screen.getByText('Absenden').closest('button') as Element
      );

      await act(async () => {
        await expect(scopeIsDone(creationScope)).resolves.toBe(true);
      });

      expect(pathname).toBe('/admin/users');
    });
  });
});
