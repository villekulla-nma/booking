import { vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks/dom';
import nock from 'nock';
import { UserResponse } from '@booking/types';

import { useUser } from '../use-user';
import { getUser } from '../../api';

vi.mock('../../api');

describe('User-User', () => {
  const user: UserResponse = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    fullName: 'Person1 One',
    role: 'user',
    unitId: 'Uj5SAS740',
  };

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('indeterminate', () => {
    it('should return undefined', () => {
      (getUser as Mock).mockImplementation(() => ({
        then: () => undefined,
      }));

      const {
        result: { current: user },
      } = renderHook(() => useUser());

      expect(user).toBeUndefined();
    });
  });

  describe('logged-out', () => {
    it('should return null eventually', async () => {
      const { getUser: mock } = await vi.importActual<{
        getUser: typeof getUser;
      }>('../../api');
      (getUser as Mock).mockImplementation(mock);

      const scope = nock('http://localhost')
        .get('/api/user')
        .reply(401, { status: 'error' });

      const view = renderHook(() => useUser());

      await view.waitForNextUpdate();

      expect(scope.isDone()).toBe(true);
      expect(view.result.current).toBeNull();
    });
  });

  describe('logged-in', () => {
    it('should return the user eventually', async () => {
      const { getUser: mock } = await vi.importActual<{
        getUser: typeof getUser;
      }>('../../api');
      (getUser as Mock).mockImplementation(mock);

      const scope = nock('http://localhost')
        .get('/api/user')
        .reply(200, { status: 'ok', payload: user });

      const view = renderHook(() => useUser());

      await view.waitForNextUpdate();

      expect(scope.isDone()).toBe(true);
      expect(view.result.current).toEqual(user);
    });
  });
});
