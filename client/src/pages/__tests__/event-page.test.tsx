import nock from 'nock';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { EventPage } from '../event-page';
import { sleep } from '../../helpers/sleep';
import { inquireConfirmation } from '../../helpers/inquire-confirmation';
import { useMediaQuery } from '../../hooks/use-media-query';

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

jest.mock('../../helpers/inquire-confirmation', () => ({
  inquireConfirmation: jest.fn(),
}));

jest.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(),
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

  describe(`some other person's event`, () => {
    it('should display the event details', async () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);

      const eventId = 'dsgw46hrds';
      const event = {
        id: eventId,
        start: '2021-03-28T15:00:00.000Z',
        end: '2021-03-28T17:00:00.000Z',
        description: 'stuff',
        allDay: false,
        resource: { name: 'Resource #1' },
        user: { id: 'vgjt8i8kuz', firstName: 'Person2' },
      };
      const scope = nock('http://localhost')
        .get('/api/user')
        .reply(200, { user })
        .get(`/api/events/${eventId}`)
        .reply(200, event);

      render(
        <Router initialEntries={[`/events/${eventId}`]}>
          <Route path="/events/:eventId" component={EventPage} />
        </Router>
      );

      await waitFor(() =>
        screen.getByText('Resource #1 gebucht für 2 Stunden')
      );
      screen.getByText('stuff');
      screen.getByText('Gebucht von Person2');

      expect(screen.queryByText('Eintrag löschen')).toBeNull();
      expect(scope.isDone()).toBe(true);
    });
  });

  describe(`user's own event`, () => {
    beforeAll(() => {
      jest.spyOn(window, 'alert');
    });

    it('should display the event & delete it', async () => {
      (inquireConfirmation as jest.Mock).mockReturnValue(true);
      (useMediaQuery as jest.Mock).mockReturnValue(true);

      const eventId = 'dsgw46hrds';
      let pathname = `/events/${eventId}`;
      const event = {
        id: eventId,
        start: '2021-03-28T00:00:00.000Z',
        end: '2021-03-29T00:00:00.000Z',
        description: 'thingies',
        allDay: true,
        resource: { name: 'Resource #2' },
        user: { id: user.id, firstName: user.firstName },
      };
      const scope = nock('http://localhost')
        .get('/api/user')
        .reply(200, { user })
        .get(`/api/events/${eventId}`)
        .reply(200, event)
        .delete(`/api/events/${eventId}`)
        .reply(200);

      render(
        <Router initialEntries={[pathname]}>
          <Route path="/events/:eventId" component={EventPage} />
          <Route
            path="*"
            render={({ location }) => {
              pathname = location.pathname;
              return null;
            }}
          />
        </Router>
      );

      await waitFor(() => screen.getByText('Resource #2 komplett gebucht'));
      screen.getByText('thingies');
      screen.getByText('Gebucht von Person1');

      const deleteButton = screen
        .getByText('Eintrag löschen')
        .closest('button');

      fireEvent.click(deleteButton);

      expect(inquireConfirmation).toHaveBeenCalledWith(
        'Soll der Eintrag wirklich geköscht werden?'
      );

      await sleep(50);

      expect(window.alert).not.toHaveBeenCalled();
      expect(pathname).toBe('/');
      expect(scope.isDone()).toBe(true);
    });
  });
});
