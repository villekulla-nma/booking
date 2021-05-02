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
import { AdminGroupsPage } from '../admin-groups-page';
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

describe('Admin Groups Page', () => {
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
  const newGroup = {
    id: 'Qij7dg39u',
    name: 'Group #3',
  };
  const user = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    fullName: 'Person1 One',
    role: 'admin',
  };

  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('basic behaviour', () => {
    it('should render list of groups', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups });

      render(
        <Router>
          <AdminGroupsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      screen.getByText('Group #1');
      screen.getByText('Group #2');
    });
  });

  describe('adding a group', () => {
    it('should create a new group', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const initialScope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups });
      const creationScope = nock('http://localhost')
        .put('/api/groups', {
          name: newGroup.name,
        })
        .reply(200, { status: 'ok' })
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: [...groups, newGroup] });

      render(
        <Router>
          <AdminGroupsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      expect(screen.queryByText('Group #3')).toBeNull();

      fireEvent.change(screen.getByLabelText(/Create new group/) as Element, {
        target: { value: newGroup.name },
      });

      fireEvent.click(screen.getByText('Create').closest('button') as Element);

      await act(async () => {
        await expect(scopeIsDone(creationScope)).resolves.toBe(true);
      });

      screen.getByText('Group #3');
    });
  });

  describe('Editing a group', () => {
    it('should update group #2', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const newName = 'Awesome Group #2';
      const initialScope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups });
      const updateScope = nock('http://localhost')
        .post('/api/groups', {
          id: groups[1].id,
          name: newName,
        })
        .reply(200, { status: 'ok' })
        .get('/api/groups')
        .reply(200, {
          status: 'ok',
          payload: [groups[0], { id: groups[1].id, name: newName }],
        });

      render(
        <Router>
          <AdminGroupsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      fireEvent.click(screen.getByTestId(`edit-element-${groups[1].id}`));

      await waitFor(() => screen.getByTestId('overlay'));

      fireEvent.change(screen.getByLabelText('Group name'), {
        target: { value: newName },
      });

      fireEvent.click(screen.getByText('Absenden'));

      await act(async () => {
        await expect(scopeIsDone(updateScope)).resolves.toBe(true);
      });

      screen.getByText(newName);
    });
  });

  describe('deleting a group', () => {
    it('should delete group #2', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);
      (inquireConfirmation as jest.Mock).mockReturnValue(true);

      const initialScope = nock('http://localhost')
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: groups });
      const deletionScope = nock('http://localhost')
        .delete('/api/groups', {
          id: groups[1].id,
        })
        .reply(200, { status: 'ok' })
        .get('/api/groups')
        .reply(200, { status: 'ok', payload: [groups[0]] });

      render(
        <Router>
          <AdminGroupsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      screen.getByText('Group #2');

      fireEvent.click(screen.getByTestId(`delete-element-${groups[1].id}`));

      await act(async () => {
        await expect(scopeIsDone(deletionScope)).resolves.toBe(true);
      });

      expect(screen.queryByText('Group #2')).toBeNull();
    });
  });
});
