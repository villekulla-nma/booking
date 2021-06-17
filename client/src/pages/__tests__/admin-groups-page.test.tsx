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
import { AdminUnitsPage } from '../admin-units-page';
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

describe('Admin Units Page', () => {
  const units = [
    {
      id: 'Uj5SAS740',
      name: 'Unit #1',
    },
    {
      id: 'gWH5T7Kdz',
      name: 'Unit #2',
    },
  ];
  const newUnit = {
    id: 'Qij7dg39u',
    name: 'Unit #3',
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
    it('should render list of units', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });

      render(
        <Router>
          <AdminUnitsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText('Unit #1'));
      screen.getByText('Unit #2');
    });
  });

  describe('adding a unit', () => {
    it('should create a new unit', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const initialScope = nock('http://localhost')
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });
      const creationScope = nock('http://localhost')
        .put('/api/units', {
          name: newUnit.name,
        })
        .reply(200, { status: 'ok' })
        .get('/api/units')
        .reply(200, { status: 'ok', payload: [...units, newUnit] });

      render(
        <Router>
          <AdminUnitsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      const createButton = await waitFor(
        () => screen.getByLabelText(/Create new unit/) as Element
      );

      expect(screen.queryByText('Unit #3')).toBeNull();

      fireEvent.change(createButton, {
        target: { value: newUnit.name },
      });

      fireEvent.click(screen.getByText('Create').closest('button') as Element);

      await act(async () => {
        await expect(scopeIsDone(creationScope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText('Unit #3'));
    });
  });

  describe('editing a unit', () => {
    it('should update unit #2', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const newName = 'Awesome Unit #2';
      const initialScope = nock('http://localhost')
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });
      const updateScope = nock('http://localhost')
        .post('/api/units', {
          id: units[1].id,
          name: newName,
        })
        .reply(200, { status: 'ok' })
        .get('/api/units')
        .reply(200, {
          status: 'ok',
          payload: [units[0], { id: units[1].id, name: newName }],
        });

      render(
        <Router>
          <AdminUnitsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      const editButton = await waitFor(
        () => screen.getByTestId(`edit-element-${units[1].id}`) as Element
      );

      fireEvent.click(editButton);

      await waitFor(() => screen.getByTestId('overlay'));

      fireEvent.change(screen.getByLabelText('Unit name'), {
        target: { value: newName },
      });

      fireEvent.click(screen.getByText('Absenden'));

      await act(async () => {
        await expect(scopeIsDone(updateScope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText(newName));
    });
  });

  describe('deleting a unit', () => {
    it('should delete unit #2', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);
      (inquireConfirmation as jest.Mock).mockReturnValue(true);

      const initialScope = nock('http://localhost')
        .get('/api/units')
        .reply(200, { status: 'ok', payload: units });
      const deletionScope = nock('http://localhost')
        .delete('/api/units', {
          id: units[1].id,
        })
        .reply(200, { status: 'ok' })
        .get('/api/units')
        .reply(200, { status: 'ok', payload: [units[0]] });

      render(
        <Router>
          <AdminUnitsPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText('Unit #2'));

      act(() => {
        fireEvent.click(screen.getByTestId(`delete-element-${units[1].id}`));
      });

      await act(async () => {
        await expect(scopeIsDone(deletionScope)).resolves.toBe(true);
      });

      expect(screen.queryByText('Unit #2')).toBeNull();
    });
  });
});
