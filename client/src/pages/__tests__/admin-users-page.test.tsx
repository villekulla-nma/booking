import type { FC, PropsWithChildren } from 'react';
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
import { sleep } from '../../helpers/sleep';

jest.mock('../../hooks/use-user-context');
jest.mock('../../helpers/inquire-confirmation');

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../components/admin-layout.tsx', () => {
  const AdminLayout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { AdminLayout };
});

describe('Admin Users Page', () => {
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
  const userOne = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    fullName: 'Person1 One',
    role: 'user',
    unitId: 'Uj5SAS740',
  };
  const userTwo = {
    id: 'Ul2Zrv1BX',
    email: 'person.two@example.com',
    firstName: 'Person2',
    lastName: 'Two',
    fullName: 'Person2 Two',
    role: 'admin',
    unitId: 'gWH5T7Kdz',
  };
  const userThree = {
    id: 'oibxhRu2L',
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

  describe('basic behaviour', () => {
    it('should render list of users', async () => {
      (useUserContext as jest.Mock).mockReturnValue(userTwo);

      const scope = nock('http://localhost')
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

      await waitFor(() => screen.getByText('Person1 One'));
      screen.getByText('Person2 Two');
    });
  });

  describe('updating a user', () => {
    it('should update an existing user', async () => {
      (useUserContext as jest.Mock).mockReturnValue(userTwo);

      const newFirstName = 'Persona Uno';
      const initialScope = nock('http://localhost')
        .get('/api/users')
        .reply(200, { status: 'ok', payload: [userOne] });
      const overlayScope = nock('http://localhost')
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });
      const updateScope = nock('http://localhost')
        .post('/api/user', {
          id: userOne.id,
          firstName: newFirstName,
          lastName: userOne.lastName,
          email: userOne.email,
          role: userOne.role,
          unitId: userOne.unitId,
        })
        .reply(200, { status: 'ok' })
        .get('/api/users')
        .reply(200, {
          status: 'ok',
          payload: [
            {
              ...userOne,
              firstName: newFirstName,
              fullName: `${newFirstName} ${userOne.lastName}`,
            },
          ],
        });

      render(
        <Router>
          <AdminUsersPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      const editButton = await waitFor(
        () => screen.getByTestId(`edit-element-${userOne.id}`) as Element
      );

      fireEvent.click(editButton);

      await act(async () => {
        await expect(scopeIsDone(overlayScope)).resolves.toBe(true);
      });

      screen.getByTestId('overlay');

      fireEvent.change(screen.getByLabelText('Vorname'), {
        target: { value: newFirstName },
      });

      fireEvent.click(
        screen.getByText('Absenden').closest('button') as Element
      );

      await act(async () => {
        await expect(scopeIsDone(updateScope)).resolves.toBe(true);
      });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByTestId('overlay')).toBeNull();

      screen.getByText(`${newFirstName} ${userOne.lastName}`);
    });
  });

  describe('deleting a user', () => {
    it('should delete user three', async () => {
      (useUserContext as jest.Mock).mockReturnValue(userTwo);
      (inquireConfirmation as jest.Mock).mockReturnValue(true);

      const fullName = `${userThree.firstName} ${userThree.lastName}`;
      const initialScope = nock('http://localhost')
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

      await waitFor(() => screen.getByText(fullName));

      fireEvent.click(screen.getByTestId(`delete-element-${userThree.id}`));

      await act(async () => {
        await expect(scopeIsDone(deletionScope)).resolves.toBe(true);
      });

      await act(async () => {
        await sleep(50);
      });

      expect(screen.queryByText(fullName)).toBeNull();
    });
  });
});
