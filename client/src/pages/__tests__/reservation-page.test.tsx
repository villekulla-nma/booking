import type { FC } from 'react';
import nock from 'nock';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { ReservationPage } from '../reservation-page';
import { scopeIsDone } from '../../helpers/nock';

const DATE_REGEXP = /^(?:Mo|Di|Mi|Do|Fr|Sa|So),\s\d+\.\s(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s\d{4}$/;

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

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

    const elemStart = screen.getByTestId('start');
    const elemStartDate = elemStart.querySelector('input') as HTMLInputElement;
    const elemStartTime = elemStart.querySelector(
      '[aria-selected]'
    ) as HTMLElement;
    const elemEnd = screen.getByTestId('end');
    const elemEndDate = elemEnd.querySelector('input') as HTMLInputElement;
    const elemEndTime = elemEnd.querySelector('[aria-selected]') as HTMLElement;
    const textarea = screen.getByLabelText('Beschreibung');
    const submit = screen
      .getByText('Speichern')
      .closest('button') as HTMLButtonElement;

    expect(elemStartDate.value).toMatch(DATE_REGEXP);
    expect(elemStartTime.textContent).toBe('09:00 Uhr');
    expect(elemEndDate.value).toMatch(DATE_REGEXP);
    expect(elemEndTime.textContent).toBe('13:30 Uhr');

    fireEvent.change(textarea, { target: { value: description } });

    expect(fireEvent.click(submit)).toBe(true);

    await act(async () => {
      await expect(scopeIsDone(scope)).resolves.toBe(true);
    });

    expect(pathname).toBe(`/resources/${resourceId}`);
  });

  it('should display the time for an all-day events', async () => {
    const resourceId = 'Uj5SAS740';
    const date = new Date(Date.now() + 24 * 3600 * 1000);
    const [tomorrow] = date.toISOString().split('T');
    const pathname = `/resources/${resourceId}/create`;
    const start = `${tomorrow}T09:00:00.000Z`;
    const end = `${tomorrow}T13:30:00.000Z`;
    const state = { allDay: true, start, end };

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

    expect(elemStartTime).toBeNull();
    expect(elemEndTime).toBeNull();
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
      screen.getByText('Beim speichern der Buchung ist ein Fehler aufgetreten.')
    );
  });
});
