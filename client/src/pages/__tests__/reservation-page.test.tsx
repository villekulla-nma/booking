import type { FC } from 'react';
import nock from 'nock';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import type { Location } from 'history';
import { initializeIcons } from '@uifabric/icons';

import { ReservationPage } from '../reservation-page';
import { scopeIsDone } from '../../helpers/nock';
import { sleep } from '../../helpers/sleep';
import {
  getDateTimeToday,
  createRoundedDateString,
  normalizeCalendarDate,
  denormalizeCalendarDate,
} from '../../helpers/date';

const DATE_REGEXP = /^(?:Mo|Di|Mi|Do|Fr|Sa|So),\s\d+\.\s(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s\d{4}$/;

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../helpers/date');

describe('Reservation Page', () => {
  initializeIcons();

  describe('with given date values', () => {
    beforeAll(() => {
      nock.disableNetConnect();
    });

    beforeEach(() => {
      (getDateTimeToday as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').getDateTimeToday
      );
      (createRoundedDateString as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').createRoundedDateString
      );
      (normalizeCalendarDate as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').normalizeCalendarDate
      );
      (denormalizeCalendarDate as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').denormalizeCalendarDate
      );
    });

    afterAll(() => {
      nock.restore();
    });

    describe('invalid session', () => {
      it('should redirect to the login page', async () => {
        const resourceId = 'Uj5SAS740';
        const reservationPagePath = `/resources/${resourceId}/create`;
        const getUserConfirmation = jest.fn();
        const scope = nock('http://localhost')
          .put(`/api/resources/${resourceId}/events`, () => true)
          .reply(401, { status: 'error' });
        let pathname = '';
        let from: string | undefined;

        render(
          <Router
            initialEntries={[reservationPagePath]}
            getUserConfirmation={getUserConfirmation}
          >
            <Switch>
              <Route
                path="/resources/:resourceId/create"
                exact={true}
                component={ReservationPage}
              />
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

        const submit = screen
          .getByText('Speichern')
          .closest('button') as HTMLButtonElement;

        expect(fireEvent.click(submit)).toBe(true);
        await expect(scopeIsDone(scope)).resolves.toBe(true);
        expect(pathname).toBe('/login');
        expect(from).toBe(reservationPagePath);
      });
    });

    describe('valid session', () => {
      it('should render the form & submit creation request', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        let pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: false, start, end };
        const description = 'Some nice event!';
        const getUserConfirmation = jest.fn();
        const scope = nock('http://localhost')
          .put(
            `/api/resources/${resourceId}/events`,
            (body) =>
              body.start === start &&
              body.end === end &&
              body.description === description &&
              body.allDay === false
          )
          .reply(200, { status: 'ok' });

        render(
          <Router
            initialEntries={[{ pathname, state }]}
            getUserConfirmation={getUserConfirmation}
          >
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
            <Route
              path="*"
              render={({ location }) => {
                pathname = location.pathname;
                return null;
              }}
            />
          </Router>
        );

        const elemStartDate = screen.getByLabelText(
          'Beginn'
        ) as HTMLInputElement;
        const elemStartTime = screen.getByLabelText(
          'Beginn (Uhrzeit)'
        ) as HTMLElement;
        const elemEndDate = screen.getByLabelText('Ende') as HTMLInputElement;
        const elemEndTime = screen.getByLabelText(
          'Ende (Uhrzeit)'
        ) as HTMLElement;
        const textarea = screen.getByLabelText('Beschreibung');
        const submit = screen
          .getByText('Speichern')
          .closest('button') as HTMLButtonElement;

        expect(elemStartDate.value).toMatch(DATE_REGEXP);
        expect(elemStartTime.textContent).toMatch(/^09:00 Uhr/);
        expect(elemEndDate.value).toMatch(DATE_REGEXP);
        expect(elemEndTime.textContent).toMatch(/^13:30 Uhr/);

        fireEvent.change(textarea, { target: { value: description } });

        expect(fireEvent.click(submit)).toBe(true);

        await act(async () => {
          await expect(scopeIsDone(scope)).resolves.toBe(true);
        });
        await sleep(50);

        expect(pathname).toBe(`/resources/${resourceId}`);
        expect(getUserConfirmation).not.toHaveBeenCalled();
      });

      it('should display the time for an all-day events & submit correctly', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        const pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: true, start, end };
        const scope = nock('http://localhost')
          .put(
            `/api/resources/${resourceId}/events`,
            (body) =>
              body.start === start.replace('T09:', 'T00:') &&
              body.end === end.replace('T13:30:', 'T00:00:') &&
              body.description === '' &&
              body.allDay === true
          )
          .reply(200, { status: 'ok' });

        render(
          <Router initialEntries={[{ pathname, state }]}>
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
          </Router>
        );

        const elemStartTime = screen
          .getByTestId('start')
          .querySelector('[aria-selected]');
        const elemEndTime = screen
          .getByTestId('end')
          .querySelector('[aria-selected]');
        const submit = screen
          .getByText('Speichern')
          .closest('button') as HTMLButtonElement;

        expect(elemStartTime).toBeNull();
        expect(elemEndTime).toBeNull();

        expect(fireEvent.click(submit)).toBe(true);

        await act(async () => {
          await expect(scopeIsDone(scope)).resolves.toBe(true);
        });
      });

      it('should warn on overlapping events', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        const pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: false, start, end };
        const scope = nock('http://localhost')
          .put(`/api/resources/${resourceId}/events`)
          .reply(200, { status: 'overlapping' });

        render(
          <Router initialEntries={[{ pathname, state }]}>
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
          </Router>
        );

        const submit = screen
          .getByText('Speichern')
          .closest('button') as HTMLButtonElement;

        await act(async () => {
          expect(fireEvent.click(submit)).toBe(true);
          await expect(scopeIsDone(scope)).resolves.toBe(true);
        });

        await waitFor(() =>
          screen.getByText(
            'Die Buchung überschneidet sich mit einer existierenden Buchung.'
          )
        );
      });

      it('should display a warning on invalid data', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        const pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: false, start, end };
        const scope = nock('http://localhost')
          .put(`/api/resources/${resourceId}/events`)
          .reply(200, { status: 'invalid' });

        render(
          <Router initialEntries={[{ pathname, state }]}>
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
          </Router>
        );

        const submit = screen
          .getByText('Speichern')
          .closest('button') as HTMLButtonElement;

        act(() => {
          expect(fireEvent.click(submit)).toBe(true);
        });

        await act(async () => {
          await expect(scopeIsDone(scope)).resolves.toBe(true);
        });

        await waitFor(() =>
          screen.getByText('Eine oder mehrere Angaben sind ungültig.')
        );
      });

      it('should display an error message', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        const pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: false, start, end };
        const scope = nock('http://localhost')
          .put(`/api/resources/${resourceId}/events`)
          .reply(200, { status: 'error' });

        render(
          <Router initialEntries={[{ pathname, state }]}>
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
          </Router>
        );

        const submit = screen
          .getByText('Speichern')
          .closest('button') as HTMLButtonElement;

        act(() => {
          expect(fireEvent.click(submit)).toBe(true);
        });

        await act(async () => {
          await expect(scopeIsDone(scope)).resolves.toBe(true);
        });

        await waitFor(() =>
          screen.getByText(
            'Beim speichern der Buchung ist ein Fehler aufgetreten.'
          )
        );
      });

      it('should prevent navigation when description is entered', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        const pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: false, start, end };
        const description = 'Some nice event!';
        const getUserConfirmation = jest.fn().mockReturnValue(false);
        let navigatedAway = false;

        render(
          <Router
            initialEntries={[{ pathname, state }]}
            getUserConfirmation={getUserConfirmation}
          >
            <Switch>
              <Route
                path="/resources/:resourceId/create"
                component={ReservationPage}
              />
              <Route
                path="*"
                render={() => {
                  navigatedAway = true;
                  return null;
                }}
              />
            </Switch>
          </Router>
        );

        const textarea = screen.getByLabelText(
          'Beschreibung'
        ) as HTMLTextAreaElement;
        const abort = screen.getByText('Abbrechen');

        fireEvent.change(textarea, { target: { value: description } });
        fireEvent.click(abort);

        expect(getUserConfirmation).toHaveBeenCalled();
        expect(navigatedAway).toBe(false);
      });

      it('should navigate back on aborting', async () => {
        const resourceId = 'Uj5SAS740';
        const date = new Date(Date.now() + 24 * 3600 * 1000);
        const [tomorrow] = date.toISOString().split('T');
        const pathname = `/resources/${resourceId}/create`;
        const start = `${tomorrow}T09:00:00.000Z`;
        const end = `${tomorrow}T13:30:00.000Z`;
        const state = { allDay: false, start, end };
        const getUserConfirmation = jest.fn();
        let newPathname = '';

        render(
          <Router
            initialEntries={[{ pathname, state }]}
            getUserConfirmation={getUserConfirmation}
          >
            <Switch>
              <Route
                path="/resources/:resourceId/create"
                component={ReservationPage}
              />
              <Route
                path="*"
                render={({ location }) => {
                  newPathname = location.pathname;
                  return null;
                }}
              />
            </Switch>
          </Router>
        );

        const abort = screen.getByText('Abbrechen');

        fireEvent.click(abort);

        expect(getUserConfirmation).not.toHaveBeenCalled();
        expect(newPathname).toBe(`/resources/${resourceId}`);
      });
    });
  });

  describe('without given date values', () => {
    beforeEach(() => {
      (createRoundedDateString as jest.Mock).mockImplementation(
        () => '2021-04-18T10:00:00.000Z'
      );

      (getDateTimeToday as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').getDateTimeToday
      );
      (normalizeCalendarDate as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').normalizeCalendarDate
      );
      (denormalizeCalendarDate as jest.Mock).mockImplementation(
        jest.requireActual('../../helpers/date').denormalizeCalendarDate
      );
    });

    it('should initialize the form with sensible values', () => {
      const getUserConfirmation = jest.fn();
      const pathname = '/resources/Uj5SAS740/create';

      render(
        <Router
          initialEntries={[pathname]}
          getUserConfirmation={getUserConfirmation}
        >
          <Switch>
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
          </Switch>
        </Router>
      );

      const elemStartDate = screen.getByLabelText('Beginn') as HTMLInputElement;
      const elemStartTime = screen.getByLabelText(
        'Beginn (Uhrzeit)'
      ) as HTMLElement;
      const elemEndDate = screen.getByLabelText('Ende') as HTMLInputElement;
      const elemEndTime = screen.getByLabelText(
        'Ende (Uhrzeit)'
      ) as HTMLElement;

      expect(elemStartDate.value).toBe('So, 18. April 2021');
      expect(elemStartTime.textContent).toMatch(/^10:00 Uhr/);
      expect(elemEndDate.value).toBe('So, 18. April 2021');
      expect(elemEndTime.textContent).toMatch(/^10:30 Uhr/);
    });

    it('should allow to switch between all-day & hour-based events', () => {
      const getUserConfirmation = jest.fn();
      const pathname = '/resources/Uj5SAS740/create';

      render(
        <Router
          initialEntries={[pathname]}
          getUserConfirmation={getUserConfirmation}
        >
          <Switch>
            <Route
              path="/resources/:resourceId/create"
              component={ReservationPage}
            />
          </Switch>
        </Router>
      );

      const checkbox = screen.getByLabelText('ganztägig');

      screen.getByLabelText('Beginn (Uhrzeit)');
      screen.getByLabelText('Ende (Uhrzeit)');

      fireEvent.click(checkbox);

      expect(screen.queryByLabelText('Beginn (Uhrzeit)')).toBeNull();
      expect(screen.queryByLabelText('Ende (Uhrzeit)')).toBeNull();

      fireEvent.click(checkbox);

      screen.getByLabelText('Beginn (Uhrzeit)');
      screen.getByLabelText('Ende (Uhrzeit)');
    });
  });
});
