import type { FC } from 'react';
import nock from 'nock';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { EventPage } from '../event-page';
import { inquireConfirmation } from '../../helpers/inquire-confirmation';
import { useMediaQuery } from '../../hooks/use-media-query';
import { useUserContext } from '../../hooks/use-user-context';
import { scopeIsDone } from '../../helpers/nock';

jest.mock('../../hooks/use-user-context');

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

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
    it.each([
      [
        '2021-03-28T15:00:00.000Z',
        '2021-03-28T17:00:00.000Z',
        'etwa 2 Stunden',
      ],
      [
        '2021-03-28T15:00:00.000Z',
        '2021-03-29T12:30:00.000Z',
        'etwa 22 Stunden',
      ],
      ['2021-03-28T15:00:00.000Z', '2021-03-29T15:00:00.000Z', 'ein Tag'],
      ['2021-03-28T15:00:00.000Z', '2021-03-29T16:30:00.000Z', 'ein Tag'],
    ])('should display the event details', async (start, end, duration) => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);
      (useUserContext as jest.Mock).mockReturnValue(user);

      const eventId = 'dsgw46hrds';
      const event = {
        id: eventId,
        description: 'stuff',
        allDay: false,
        resource: { name: 'Resource #1' },
        user: { id: 'vgjt8i8kuz', firstName: 'Person2' },
        start,
        end,
      };
      const scope = nock('http://localhost')
        .get(`/api/events/${eventId}`)
        .reply(200, event);

      render(
        <Router initialEntries={[`/events/${eventId}`]}>
          <Route path="/events/:eventId" component={EventPage} />
        </Router>
      );

      await waitFor(() =>
        screen.getByText(`Resource #1 gebucht für ${duration}`)
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
      (useUserContext as jest.Mock).mockReturnValue(user);

      const eventId = 'dsgw46hrds';
      let pathname = `/events/${eventId}`;
      const event = {
        id: eventId,
        start: '2021-03-28T00:00:00.000Z',
        end: '2021-03-30T00:00:00.000Z',
        description: 'thingies',
        allDay: true,
        resource: { name: 'Resource #2' },
        user: { id: user.id, firstName: user.firstName },
      };
      const scope = nock('http://localhost')
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

      await waitFor(() => screen.getByText('Resource #2 gebucht für 2 Tage'));
      screen.getByText('thingies');
      screen.getByText('Gebucht von Person1');

      const deleteButton = screen
        .getByText('Eintrag löschen')
        .closest('button') as HTMLButtonElement;

      fireEvent.click(deleteButton);

      expect(inquireConfirmation).toHaveBeenCalledWith(
        'Soll der Eintrag wirklich geköscht werden?'
      );

      await expect(scopeIsDone(scope)).resolves.toBe(true);
      expect(window.alert).not.toHaveBeenCalled();
      expect(pathname).toBe('/');
    });
  });
});
