import type { FC } from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import nock from 'nock';
import { initializeIcons } from '@uifabric/icons';

import { scopeIsDone } from '../../helpers/nock';
import { useUserContext } from '../../hooks/use-user-context';
import { AdminUsersPage } from '../admin-users-page';
import { inquireConfirmation } from '../../helpers/inquire-confirmation';

jest.mock('../../hooks/use-user-context');
jest.mock('../../helpers/inquire-confirmation');

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../components/admin-layout.tsx', () => {
  const AdminLayout: FC = ({ children }) => <>{children}</>;
  return { AdminLayout };
});

describe('Admin Users Page', () => {
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
  const userOne = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    fullName: 'Person1 One',
    role: 'user',
  };
  const userTwo = {
    id: 'Ul2Zrv1BX',
    email: 'person.two@example.com',
    firstName: 'Person2',
    lastName: 'Two',
    fullName: 'Person2 Two',
    role: 'admin',
  };
  const userThree = {
    id: 'oibxhRu2L',
    email: 'person.three@example.com',
    firstName: 'Person3',
    lastName: 'Three',
    fullName: 'Person3 Three',
    role: 'user',
  };

  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('basic behaviour', () => {
    it('should render list of users', async () => {
      (useUserContext as jest.Mock).mockReturnValue(userTwo);

      const scope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups })
        .get('/api/users')
        .reply(200, { status: 'ok', payload: [userOne, userTwo] });

      render(
        <Router>
          <AdminUsersPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      screen.getByText('Person1 One [user]');
      screen.getByText('Person2 Two [admin]');
    });
  });

  describe('adding a user', () => {
    it('should create a new user', async () => {
      (useUserContext as jest.Mock).mockReturnValue(userTwo);

      const groupId = 'Uj5SAS740';
      const fullName = 'Person3 Three';
      const initialScope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups })
        .get('/api/users')
        .reply(200, { status: 'ok', payload: [userOne, userTwo] });
      const creationScope = nock('http://localhost')
        .put('/api/user', {
          firstName: userThree.firstName,
          lastName: userThree.lastName,
          email: userThree.email,
          role: userThree.role,
          groupId,
        })
        .reply(200, { status: 'ok' })
        .get('/api/users')
        .reply(200, { status: 'ok', payload: [userOne, userTwo, userThree] });

      render(
        <Router>
          <AdminUsersPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      expect(screen.queryByText(`${fullName} [${userThree.role}]`)).toBeNull();

      fireEvent.click(screen.getByText(/Create new user/) as Element);

      await waitFor(() => screen.getByTestId('overlay'));

      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: userThree.firstName },
      });
      fireEvent.change(screen.getByLabelText('Last name'), {
        target: { value: userThree.lastName },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: userThree.email },
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

      fireEvent.click(screen.getByText('Create').closest('button') as Element);

      await act(async () => {
        await expect(scopeIsDone(creationScope)).resolves.toBe(true);
      });

      screen.getByText(`${fullName} [${userThree.role}]`);
    });
  });

  describe('deleting a user', () => {
    it('should delete user three', async () => {
      (useUserContext as jest.Mock).mockReturnValue(userTwo);
      (inquireConfirmation as jest.Mock).mockReturnValue(true);

      const fullName = 'Person3 Three';
      const initialScope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups })
        .get('/api/users')
        .reply(200, { status: 'ok', payload: [userOne, userTwo, userThree] });
      const deletionScope = nock('http://localhost')
        .delete('/api/user', {
          id: userThree.id,
        })
        .reply(200, { status: 'ok' })
        .get('/api/users')
        .reply(200, { status: 'ok', payload: [userOne, userTwo] });

      render(
        <Router>
          <AdminUsersPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      screen.getByText(`${fullName} [${userThree.role}]`);

      fireEvent.click(screen.getByTestId(`delete-element-${userThree.id}`));

      await act(async () => {
        await expect(scopeIsDone(deletionScope)).resolves.toBe(true);
      });

      expect(screen.queryByText(`${fullName} [${userThree.role}]`)).toBeNull();
    });
  });
});
