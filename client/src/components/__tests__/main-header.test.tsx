import type { FC } from 'react';
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
import { useMediaQuery } from '../../hooks/use-media-query';
import { useUserContext } from '../../hooks/use-user-context';
import { scopeIsDone } from '../../helpers/nock';

jest.mock('../../hooks/use-user-context');

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

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

  describe(`logged-in`, () => {
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
