import { vi } from 'vitest';
import type { FC, PropsWithChildren } from 'react';
import nock from 'nock';
import { render, screen, fireEvent } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { PasswordResetPage } from '../password-reset-page';
import { MemoryRouterShim as Router } from '../../components/router-shim';

vi.mock('../../components/layout.tsx', () => {
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

  it('should successfully reset the password', async () => {
    const scope = nock('http://localhost')
      .post('/api/password-reset', {
        email: 'person.one@example.com',
      })
      .reply(200);

    render(
      <Router initialEntries={['/password-reset']}>
        <Route path="/password-reset" component={PasswordResetPage} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'person.one@example.com' },
    });
    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText(
      /Dein Passwort wurde erfolgreich zurück gesetzt. Bitte wende dich an/
    );

    expect(scope.isDone()).toBe(true);
  });

  it('should show success message even in case of server error', async () => {
    const scope = nock('http://localhost')
      .post('/api/password-reset')
      .reply(500);

    render(
      <Router initialEntries={['/password-reset']}>
        <Route path="/password-reset" component={PasswordResetPage} />
      </Router>
    );

    fireEvent.click(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText('Absenden').closest('button') as HTMLButtonElement
    );

    await screen.findByText(
      /Dein Passwort wurde erfolgreich zurück gesetzt. Bitte wende dich an/
    );

    expect(scope.isDone()).toBe(true);
  });
});
