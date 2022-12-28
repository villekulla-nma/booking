import type { FC, PropsWithChildren } from 'react';
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
import { AdminResourcesPage } from '../admin-resources-page';
import { inquireConfirmation } from '../../helpers/inquire-confirmation';
import { MemoryRouterShim as Router } from '../../components/router-shim';

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

describe('Admin Resources Page', () => {
  const resources = [
    {
      id: 'Uj5SAS740',
      name: 'Resource #1',
    },
    {
      id: 'gWH5T7Kdz',
      name: 'Resource #2',
    },
  ];
  const newResource = {
    id: 'Qij7dg39u',
    name: 'Resource #3',
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
    it('should render list of resources', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const scope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, { status: 'ok', payload: resources });

      render(
        <Router>
          <AdminResourcesPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(scope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText('Resource #1'));
      screen.getByText('Resource #2');
    });
  });

  describe('adding a resource', () => {
    it('should create a new resource', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const initialScope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, { status: 'ok', payload: resources });
      const creationScope = nock('http://localhost')
        .put('/api/resources', {
          name: newResource.name,
        })
        .reply(200, { status: 'ok' })
        .get('/api/resources')
        .reply(200, {
          status: 'ok',
          payload: [...resources, newResource],
        });

      render(
        <Router>
          <AdminResourcesPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      const createButton = await waitFor(
        () => screen.getByLabelText(/Create new resource/) as Element
      );

      expect(screen.queryByText('Resource #3')).toBeNull();

      fireEvent.change(createButton, {
        target: { value: newResource.name },
      });

      fireEvent.click(screen.getByText('Create').closest('button') as Element);

      await act(async () => {
        await expect(scopeIsDone(creationScope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText('Resource #3'));
    });
  });

  describe('Editing a resource', () => {
    it('should update resource #2', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);

      const newName = 'Awesome Resource #2';
      const initialScope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, { status: 'ok', payload: resources });
      const updateScope = nock('http://localhost')
        .post('/api/resources', {
          id: resources[1].id,
          name: newName,
        })
        .reply(200, { status: 'ok' })
        .get('/api/resources')
        .reply(200, {
          status: 'ok',
          payload: [resources[0], { id: resources[1].id, name: newName }],
        });

      render(
        <Router>
          <AdminResourcesPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope, 300)).resolves.toBe(true);
      });

      const editButton = await waitFor(
        () => screen.getByTestId(`edit-element-${resources[1].id}`) as Element
      );

      fireEvent.click(editButton);

      await waitFor(() => screen.getByTestId('overlay'));

      fireEvent.change(screen.getByLabelText('Resource name'), {
        target: { value: newName },
      });

      fireEvent.click(screen.getByText('Absenden'));

      await act(async () => {
        await expect(scopeIsDone(updateScope, 300)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText(newName));
    });
  });

  describe('deleting a resource', () => {
    it('should delete resource #2', async () => {
      (useUserContext as jest.Mock).mockReturnValue(user);
      (inquireConfirmation as jest.Mock).mockReturnValue(true);

      const initialScope = nock('http://localhost')
        .get('/api/resources')
        .reply(200, { status: 'ok', payload: resources });
      const deletionScope = nock('http://localhost')
        .delete('/api/resources', {
          id: resources[1].id,
        })
        .reply(200, { status: 'ok' })
        .get('/api/resources')
        .reply(200, { status: 'ok', payload: [resources[0]] });

      render(
        <Router>
          <AdminResourcesPage />
        </Router>
      );

      await act(async () => {
        await expect(scopeIsDone(initialScope)).resolves.toBe(true);
      });

      await waitFor(() => screen.getByText('Resource #2'));

      act(() => {
        fireEvent.click(
          screen.getByTestId(`delete-element-${resources[1].id}`)
        );
      });

      await act(async () => {
        await expect(scopeIsDone(deletionScope)).resolves.toBe(true);
      });

      expect(screen.queryByText('Resource #2')).toBeNull();
    });
  });
});
