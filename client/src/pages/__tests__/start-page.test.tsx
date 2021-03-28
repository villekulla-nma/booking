import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter as Router } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { StartPage } from '../start-page';

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

  describe('No upcoming events', () => {
    it('should not display any events', async () => {
      const scope = nock('http://localhost')
        .get('/api/user')
        .reply(200, { user })
        .get('/api/user/events')
        .query({ limit: 10 })
        .reply(200, { events: [] });

      render(
        <Router>
          <StartPage />
        </Router>
      );

      await waitFor(() => screen.getByText('Es stehen keine Buchungen an.'));

      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Some upcoming events', () => {
    it('should display events', async () => {
      const [today] = new Date().toISOString().split('T');
      const scope = nock('http://localhost')
        .get('/api/user')
        .reply(200, { user })
        .get('/api/user/events')
        .query({ limit: 10 })
        .reply(200, {
          events: [
            {
              id: 'SHYVTIGoM',
              start: `${today}T09:00:00.000Z`,
              end: `${today}T10:00:00.000Z`,
              description: 'Thingies...',
              allDay: false,
              resource: 'Resource #1',
            },
          ],
        });

      render(
        <Router>
          <StartPage />
        </Router>
      );

      const link = await waitFor(() => screen.getByText('Resource #1'));

      screen.getByText('Thingies...');

      expect(link).toBeInstanceOf(HTMLAnchorElement);
      expect((link as HTMLAnchorElement).href).toContain('/events/SHYVTIGoM');
      expect(scope.isDone()).toBe(true);
    });
  });
});
