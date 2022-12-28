import type { FC, PropsWithChildren } from 'react';
import nock from 'nock';
import { render, screen, fireEvent } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { PasswordUpdatePage } from '../password-update-page';
import { MemoryRouterShim as Router } from '../../components/router-shim';

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

describe('Resource Page', () => {
  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  it('should successfully update the password', async () => {
    const token = 'password-reset-token';
    const scope = nock('http://localhost')
      .post(`/api/password-reset/${token}`, {
        password: '12345',
        password_confirm: '12345',
      })
      .reply(200, { status: 'ok' });

    render(
      <Router initialEntries={[`/password-reset/${token}`]}>
        <Route path="/password-reset/:token" component={PasswordUpdatePage} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Passwort wiederholen'), {
      target: { value: '12345' },
    });
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText('Passwort erfolgreich zurück gesetzt.');

    expect(scope.isDone()).toBe(true);
  });

  it('should warn on mismatch', async () => {
    const token = 'password-reset-token';
    const scope = nock('http://localhost')
      .post(`/api/password-reset/${token}`, {
        password: '12345',
        password_confirm: '67890',
      })
      .reply(200, { status: 'invalid' });

    render(
      <Router initialEntries={[`/password-reset/${token}`]}>
        <Route path="/password-reset/:token" component={PasswordUpdatePage} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Passwort'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Passwort wiederholen'), {
      target: { value: '67890' },
    });
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText('Die Passwörter stimmen leider nicht überein.');

    expect(scope.isDone()).toBe(true);
  });

  it('should give ffedback on error', async () => {
    const token = 'password-reset-token';
    const scope = nock('http://localhost')
      .post(`/api/password-reset/${token}`)
      .reply(200, { status: 'error' });

    render(
      <Router initialEntries={[`/password-reset/${token}`]}>
        <Route path="/password-reset/:token" component={PasswordUpdatePage} />
      </Router>
    );

    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText(
      'Ein Fehler ist aufgetreten. Bitte versuch es noch einmal.'
    );

    expect(scope.isDone()).toBe(true);
  });
});
