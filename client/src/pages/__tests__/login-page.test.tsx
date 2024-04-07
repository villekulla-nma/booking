import { vi, type Mock } from 'vitest';
import type { FC, PropsWithChildren } from 'react';
import nock from 'nock';
import { render, screen, fireEvent } from '@testing-library/react';
import { Route, Switch } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { LoginPage } from '../login-page';
import { redirect } from '../../helpers/location';
import { scopeIsDone } from '../../helpers/nock';
import { useUserContext } from '../../hooks/use-user-context';
import { sleep } from '../../helpers/sleep';
import { MemoryRouterShim as Router } from '../../components/router-shim';
import { waitFor as customWaitFor } from '../../helpers/wait-for';

vi.mock('../../hooks/use-user-context');

vi.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

vi.mock('../../helpers/location', () => ({
  redirect: vi.fn(),
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
    (useUserContext as Mock).mockReturnValue(null);

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
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await expect(scopeIsDone(scope)).resolves.toBe(true);
    await sleep(50);
    expect(redirect).toHaveBeenCalledWith(from);
  });

  it('should warn if the user is not verified', async () => {
    (useUserContext as Mock).mockReturnValue(null);

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
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText('Bitte verfifiziere deinen Nutzer.');

    expect(passwordField.value).toBe('');
    expect(scope.isDone()).toBe(true);
  });

  it('should warn if the given data is not valid', async () => {
    (useUserContext as Mock).mockReturnValue(null);

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
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText('Nutzername oder Passwort sind nicht korrekt.');

    expect(passwordField.value).toBe('');
    expect(scope.isDone()).toBe(true);
  });

  it('should give feedback if there was an error', async () => {
    (useUserContext as Mock).mockReturnValue(null);

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
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText(
      'Etwas ist schief gelaufen. Bitte versuche es noch einmal.'
    );

    expect(passwordField.value).toBe('');
    expect(scope.isDone()).toBe(true);
  });

  it('should redirect authenticated users to the startpage', async () => {
    (useUserContext as Mock).mockReturnValue({ id: 'abc123' });

    const pagePath = '/login';
    let pathname = '';

    render(
      <Router initialEntries={[pagePath]}>
        <Switch>
          <Route path="/login" exact={true} component={LoginPage} />
          <Route
            path="*"
            render={({ location }) => {
              pathname = location.pathname;
              return null;
            }}
          />
        </Switch>
      </Router>
    );

    await customWaitFor(() => pathname !== '', 200);

    expect(pathname).toBe('/');
  });
});
