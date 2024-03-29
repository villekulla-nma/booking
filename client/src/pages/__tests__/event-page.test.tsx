import { vi, type Mock } from 'vitest';
import type { FC, PropsWithChildren } from 'react';
import nock from 'nock';
import { render, screen, fireEvent } from '@testing-library/react';
import { Route, Switch } from 'react-router-dom';
import type { Location } from 'history';
import { initializeIcons } from '@uifabric/icons';

import { EventPage } from '../event-page';
import { inquireConfirmation } from '../../helpers/inquire-confirmation';
import { useMediaQuery } from '../../hooks/use-media-query';
import { useUserContext } from '../../hooks/use-user-context';
import { scopeIsDone } from '../../helpers/nock';
import { waitFor as customWaitFor } from '../../helpers/wait-for';
import { sleep } from '../../helpers/sleep';
import { MemoryRouterShim as Router } from '../../components/router-shim';

vi.mock('../../hooks/use-user-context');

vi.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

vi.mock('../../helpers/inquire-confirmation', () => ({
  inquireConfirmation: vi.fn(),
}));

vi.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: vi.fn(),
}));

const getDateAhead = (days = 1): string | undefined =>
  new Date(Date.now() + days * 24 * 3600 * 1000)
    .toISOString()
    .split('T')
    .shift();

describe('Event Page', () => {
  const user = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    role: 'user',
  };
  const admin = {
    id: 'Ul2Zrv1BX',
    email: 'person.two@example.com',
    firstName: 'Person2',
    lastName: 'Two',
    role: 'admin',
  };

  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('invalid session', () => {
    it('should redirect to the login page', async () => {
      const eventId = 'dsgw46hrds';
      const eventPagePath = `/events/${eventId}`;
      const scope = nock('http://localhost')
        .get(`/api/events/${eventId}`)
        .reply(401, { status: 'error' });
      let pathname = '';
      let from: string | undefined;

      render(
        <Router initialEntries={[eventPagePath]}>
          <Switch>
            <Route path="/events/:eventId" exact={true} component={EventPage} />
            <Route
              path="*"
              render={({ location }) => {
                pathname = location.pathname;
                from = (location as Location<{ from?: string }>).state.from;
                return null;
              }}
            />
          </Switch>
        </Router>
      );

      await expect(scopeIsDone(scope)).resolves.toBe(true);
      await customWaitFor(() => pathname !== '', 200);
      expect(pathname).toBe('/login');
      expect(from).toBe(eventPagePath);
    });
  });

  describe(`some other person's event`, () => {
    it.each([
      [
        'etwa 2 Stunden',
        '2021-03-28T15:00:00.000Z',
        '2021-03-28T17:00:00.000Z',
      ],
      [
        'etwa 22 Stunden',
        '2021-03-28T15:00:00.000Z',
        '2021-03-29T12:30:00.000Z',
      ],
      ['1 Tag', '2021-03-28T15:00:00.000Z', '2021-03-29T15:00:00.000Z'],
      ['1 Tag', '2021-03-28T15:00:00.000Z', '2021-03-29T16:30:00.000Z'],
    ])(
      'should display the event details (%s)',
      async (duration, start, end) => {
        (useMediaQuery as Mock).mockReturnValue(true);
        (useUserContext as Mock).mockReturnValue(user);

        const eventId = 'dsgw46hrds';
        const event = {
          id: eventId,
          description: 'stuff',
          allDay: false,
          resource: { name: 'Resource #1' },
          user: { id: 'vgjt8i8kuz', firstName: 'Person2' },
          createdAt: '2021-03-25T10:15:56.000Z',
          start,
          end,
        };
        const scope = nock('http://localhost')
          .get(`/api/events/${eventId}`)
          .reply(200, { status: 'ok', payload: event });

        render(
          <Router initialEntries={[`/events/${eventId}`]}>
            <Route path="/events/:eventId" component={EventPage} />
          </Router>
        );

        await screen.findByText(`Resource #1 gebucht für ${duration}`);
        screen.getByText('stuff');
        screen.getByText('Person2; 25. März 2021, 10:15');

        expect(screen.queryByText('Eintrag löschen')).toBeNull();
        expect(scope.isDone()).toBe(true);
      }
    );
  });

  describe(`user's own event`, () => {
    beforeAll(() => {
      vi.spyOn(window, 'alert');
    });

    it('should display the event & delete it', async () => {
      (inquireConfirmation as Mock).mockReturnValue(true);
      (useMediaQuery as Mock).mockReturnValue(true);
      (useUserContext as Mock).mockReturnValue(user);

      const startDate = getDateAhead();
      const endDate = getDateAhead(3);
      const eventId = 'dsgw46hrds';
      let pathname = `/events/${eventId}`;
      const event = {
        id: eventId,
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T00:00:00.000Z`,
        description: 'thingies',
        allDay: true,
        resource: { name: 'Resource #2' },
        user: { id: user.id, firstName: user.firstName },
        createdAt: '2021-03-25T10:15:56.000Z',
      };
      const scope = nock('http://localhost')
        .get(`/api/events/${eventId}`)
        .reply(200, { status: 'ok', payload: event })
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

      await screen.findByText('Resource #2 gebucht für 2 Tage');
      screen.getByText('thingies');
      screen.getByText('Person1; 25. März 2021, 10:15');

      const deleteButton = screen
        .getByText('Eintrag löschen')
        // eslint-disable-next-line testing-library/no-node-access
        .closest('button') as HTMLButtonElement;

      fireEvent.click(deleteButton);

      expect(inquireConfirmation).toHaveBeenCalledWith(
        'Soll der Eintrag wirklich geköscht werden?'
      );

      await expect(scopeIsDone(scope)).resolves.toBe(true);
      await sleep(50);
      expect(window.alert).not.toHaveBeenCalled();
      expect(pathname).toBe('/');
    });
  });

  describe('Deletion restrictions', () => {
    it('should not enable deletion of past events', async () => {
      (useMediaQuery as Mock).mockReturnValue(true);
      (useUserContext as Mock).mockReturnValue(user);

      const eventId = 'dsgw46hrds';
      const event = {
        id: eventId,
        start: '2021-03-28T00:00:00.000Z',
        end: '2021-03-30T00:00:00.000Z',
        description: 'past event',
        allDay: true,
        resource: { name: 'Resource #2' },
        user: { id: user.id, firstName: user.firstName },
        createdAt: '2021-03-25T10:15:56.000Z',
      };
      const scope = nock('http://localhost')
        .get(`/api/events/${eventId}`)
        .reply(200, { status: 'ok', payload: event });

      render(
        <Router initialEntries={[`/events/${eventId}`]}>
          <Route path="/events/:eventId" component={EventPage} />
        </Router>
      );

      await screen.findByText('Resource #2 gebucht für 2 Tage');

      expect(screen.queryByText('Eintrag löschen')).toBeNull();
      expect(scope.isDone()).toBe(true);
    });

    it('should not enable deletion of other users events', async () => {
      (useMediaQuery as Mock).mockReturnValue(true);
      (useUserContext as Mock).mockReturnValue(user);

      const startDate = getDateAhead();
      const endDate = getDateAhead(3);
      const eventId = 'dsgw46hrds';
      const event = {
        id: eventId,
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T00:00:00.000Z`,
        description: 'future event',
        allDay: true,
        resource: { name: 'Resource #2' },
        user: { id: 'jZNDP7oxU', firstName: 'whatever' },
        createdAt: '2021-03-25T10:15:56.000Z',
      };
      const scope = nock('http://localhost')
        .get(`/api/events/${eventId}`)
        .reply(200, { status: 'ok', payload: event });

      render(
        <Router initialEntries={[`/events/${eventId}`]}>
          <Route path="/events/:eventId" component={EventPage} />
        </Router>
      );

      await screen.findByText('Resource #2 gebucht für 2 Tage');

      expect(screen.queryByText('Eintrag löschen')).toBeNull();
      expect(scope.isDone()).toBe(true);
    });

    it('should allow deletion by admin', async () => {
      (useMediaQuery as Mock).mockReturnValue(true);
      (useUserContext as Mock).mockReturnValue(admin);

      const eventId = 'dsgw46hrds';
      const event = {
        id: eventId,
        start: '2021-03-28T00:00:00.000Z',
        end: '2021-03-30T00:00:00.000Z',
        description: 'past event',
        allDay: true,
        resource: { name: 'Resource #2' },
        user: { id: user.id, firstName: user.firstName },
        createdAt: '2021-03-25T10:15:56.000Z',
      };
      const scope = nock('http://localhost')
        .get(`/api/events/${eventId}`)
        .reply(200, { status: 'ok', payload: event });

      render(
        <Router initialEntries={[`/events/${eventId}`]}>
          <Route path="/events/:eventId" component={EventPage} />
        </Router>
      );

      await screen.findByText('Resource #2 gebucht für 2 Tage');

      screen.getByText('Eintrag löschen');
      expect(scope.isDone()).toBe(true);
    });
  });
});
