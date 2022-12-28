import type { FC, PropsWithChildren } from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import nock from 'nock';
import { initializeIcons } from '@uifabric/icons';

import { scopeIsDone } from '../../helpers/nock';
import { useUserContext } from '../../hooks/use-user-context';
import { AdminUsersCreatePage } from '../admin-users-create-page';
import { MemoryRouterShim as Router } from '../../components/router-shim';

jest.mock('../../hooks/use-user-context');

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../components/admin-layout.tsx', () => {
  const AdminLayout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { AdminLayout };
});

describe('Admin Users Create Page', () => {
  const units = [
    {
      id: 'Uj5SAS740',
      name: 'Unit #1',
      color: '#ff0000',
    },
    {
      id: 'gWH5T7Kdz',
      name: 'Unit #2',
      color: '#00ff00',
    },
  ];
  const user = {
    id: 'Ul2Zrv1BX',
    email: 'person.two@example.com',
    firstName: 'Person2',
    lastName: 'Two',
    fullName: 'Person2 Two',
    role: 'admin',
    unitId: 'gWH5T7Kdz',
  };
  const newUser = {
    email: 'person.three@example.com',
    firstName: 'Person3',
    lastName: 'Three',
    fullName: 'Person3 Three',
    role: 'user',
    unitId: 'Uj5SAS740',
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
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });

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

      await waitForElementToBeRemoved(() => screen.queryByText(/Lade Daten/));
      expect(scope.isDone()).toBe(true);

      fireEvent.click(screen.getByText('Abbrechen'));

      expect(pathname).toBe('/admin/users');
    });
  });

  describe('adding a user', () => {
    it('should create a new user', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      let pathname = '';
      const initialScope = nock('http://localhost')
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });
      const creationScope = nock('http://localhost')
        .put('/api/user', {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          unitId: 'Uj5SAS740',
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

      await waitForElementToBeRemoved(() => screen.queryByText(/Lade Daten/));
      expect(initialScope.isDone()).toBe(true);

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

      const unitSelect = screen.getByTestId('unit-select');
      fireEvent.click(unitSelect);
      fireEvent.click(
        screen.getByText('Unit #1', {
          selector: 'span',
        })
      );

      fireEvent.click(
        // eslint-disable-next-line testing-library/no-node-access
        screen.getByText('Absenden').closest('button') as Element
      );

      await act(async () => {
        await expect(scopeIsDone(creationScope)).resolves.toBe(true);
      });

      await waitFor(() => {
        expect(pathname).toBe('/admin/users');
      });
    });
  });
});
