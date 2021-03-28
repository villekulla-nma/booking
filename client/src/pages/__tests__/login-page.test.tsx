import nock from 'nock';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { LoginPage } from '../login-page';
import { sleep } from '../../helpers/sleep';
import { redirect } from '../../helpers/redirect';

jest.mock('../../components/layout.tsx', () => ({
  Layout: ({ children }) => <>{children}</>,
}));

jest.mock('../../helpers/redirect', () => ({
  redirect: jest.fn(),
}));

describe('Resource Page', () => {
  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  it('should successfully log in the user', async () => {
    const from = '/events/4zrtsev65z';
    const state = { from };
    const pathname = '/login';
    const scope = nock('http://localhost')
      .post('/api/login', {
        email: 'person.one@example.com',
        password: '1234',
      })
      .reply(200, { status: 'ok' });

    render(
      <Router initialEntries={[{ pathname, state }]}>
        <Route path={pathname} component={LoginPage} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'person.one@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByText('Absenden').closest('button'));
    await sleep(50);

    expect(redirect).toHaveBeenCalledWith(from);
    expect(scope.isDone()).toBe(true);
  });

  it('should warn if the user is not verified', async () => {
    const from = '/events/4zrtsev65z';
    const state = { from };
    const pathname = '/login';
    const scope = nock('http://localhost')
      .post('/api/login', {
        email: 'person.one@example.com',
        password: '1234',
      })
      .reply(400, { status: 'unverified' });

    render(
      <Router initialEntries={[{ pathname, state }]}>
        <Route path={pathname} component={LoginPage} />
      </Router>
    );

    const passwordField = screen.getByLabelText('Passwort') as HTMLInputElement;
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'person.one@example.com' },
    });
    fireEvent.change(passwordField, {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByText('Absenden').closest('button'));

    await waitFor(() => screen.getByText('Bitte verfifiziere deinen Nutzer.'));

    expect(passwordField.value).toBe('');
    expect(scope.isDone()).toBe(true);
  });

  it('should warn if the given data is not valid', async () => {
    const from = '/events/4zrtsev65z';
    const state = { from };
    const pathname = '/login';
    const scope = nock('http://localhost')
      .post('/api/login', {
        email: 'person.one@example.com',
        password: '5678',
      })
      .reply(401, { status: 'invalid' });

    render(
      <Router initialEntries={[{ pathname, state }]}>
        <Route path={pathname} component={LoginPage} />
      </Router>
    );

    const passwordField = screen.getByLabelText('Passwort') as HTMLInputElement;
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'person.one@example.com' },
    });
    fireEvent.change(passwordField, {
      target: { value: '5678' },
    });
    fireEvent.click(screen.getByText('Absenden').closest('button'));

    await waitFor(() =>
      screen.getByText('Nutzername oder Passwort sind nicht korrekt.')
    );

    expect(passwordField.value).toBe('');
    expect(scope.isDone()).toBe(true);
  });

  it('should give feedback if there was an error', async () => {
    const from = '/events/4zrtsev65z';
    const state = { from };
    const pathname = '/login';
    const scope = nock('http://localhost')
      .post('/api/login', {
        email: 'person.one@example.com',
        password: '5678',
      })
      .reply(500, { status: 'error' });

    render(
      <Router initialEntries={[{ pathname, state }]}>
        <Route path={pathname} component={LoginPage} />
      </Router>
    );

    const passwordField = screen.getByLabelText('Passwort') as HTMLInputElement;
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'person.one@example.com' },
    });
    fireEvent.change(passwordField, {
      target: { value: '5678' },
    });
    fireEvent.click(screen.getByText('Absenden').closest('button'));

    await waitFor(() =>
      screen.getByText(
        'Etwas ist schief gelaufen. Bitte versuche es noch einmal.'
      )
    );

    expect(passwordField.value).toBe('');
    expect(scope.isDone()).toBe(true);
  });
});
