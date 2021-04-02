import nock from 'nock';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { ReservationPage } from '../reservation-page';
import { sleep } from '../../helpers/sleep';

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

describe('Reservation Page', () => {
  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  it('should render the form & submit creation request', async () => {
    const resourceId = 'Uj5SAS740';
    const date = new Date(Date.now() + 24 * 3600 * 1000);
    const [tomorrow] = date.toISOString().split('T');
    let pathname = `/resources/${resourceId}/create`;
    const start = `${tomorrow}T09:00:00.000Z`;
    const end = `${tomorrow}T13:30:00.000Z`;
    const state = { allDay: false, start, end };
    const description = 'Some nice event!';
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
      <Router initialEntries={[{ pathname, state }]}>
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

    const elemStart = screen.getByText('Beginn').nextElementSibling;
    const elemEnd = screen.getByText('Ende').nextElementSibling;
    const textarea = screen.getByLabelText('Beschreibung');
    const submit = screen.getByText('Speichern').closest('button');

    expect(elemStart.textContent).toContain('9:00');
    expect(elemEnd.textContent).toContain('13:30');

    fireEvent.change(textarea, { target: { value: description } });
    await act(async () => {
      expect(fireEvent.click(submit)).toBe(true);
      await sleep(100);
    });

    expect(pathname).toBe(`/resources/${resourceId}`);
    expect(scope.isDone()).toBe(true);
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

    const submit = screen.getByText('Speichern').closest('button');

    await act(async () => {
      expect(fireEvent.click(submit)).toBe(true);
      await sleep(100);
    });

    screen.getByText(
      'Die Buchung überschneidet sich mit einer existierenden Buchung.'
    );

    expect(scope.isDone()).toBe(true);
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

    const submit = screen.getByText('Speichern').closest('button');

    await act(async () => {
      expect(fireEvent.click(submit)).toBe(true);
      await sleep(100);
    });

    screen.getByText('Eine oder mehrere Angaben sind ungültig.');

    expect(scope.isDone()).toBe(true);
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

    const submit = screen.getByText('Speichern').closest('button');

    await act(async () => {
      expect(fireEvent.click(submit)).toBe(true);
      await sleep(150);
    });

    screen.getByText('Beim speichern der Buchung ist ein Fehler aufgetreten.');

    expect(scope.isDone()).toBe(true);
  });
});
