import { vi } from 'vitest';
import type { FC, PropsWithChildren } from 'react';
import type { History } from 'history';
import { render, screen, fireEvent } from '@testing-library/react';
import { initializeIcons } from '@uifabric/icons';

import { ErrorBoundary } from '../error-boundary';
import { RouterShim as Router } from '../router-shim';

vi.mock('../layout.tsx', () => {
  const Layout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;
  return { Layout };
});

const Erroneous: FC = () => {
  throw new Error('nope');
  return null;
};

describe('Error-Boundary', () => {
  let log: typeof console.error;

  initializeIcons();

  beforeAll(() => {
    log = console.error;
    console.error = () => undefined;
  });

  afterAll(() => {
    console.error = log;
  });

  it('should display the error page', async () => {
    render(
      <ErrorBoundary>
        <Erroneous />
      </ErrorBoundary>
    );

    await screen.findByText(/Da ist wohl etwas schief gelaufen/);

    const emailLink = screen.getByText(
      /wende dich bitte an den Webmaster/
    ) as HTMLAnchorElement;
    const query = new URLSearchParams(emailLink.href.replace('mailto:?', ''));
    const subject = query.get('subject');
    const body = query.get('body');

    expect(subject).toMatch(/Fehler im Buchungstool/);
    expect(body).toContain('Error: nope');
    expect(body).toContain('at Erroneous');
    expect(body).toContain('Fensterbreite:');
    expect(body).toContain('Fensterhöhe:');
    expect(body).toContain('Maschine:');
  });

  it('should reset the error & navigate to the start page', async () => {
    const history = {
      replace: vi.fn(),
      listen: vi.fn(),
      location: {},
    } as unknown as History;

    render(
      <Router history={history}>
        <ErrorBoundary>
          <Erroneous />
        </ErrorBoundary>
      </Router>
    );

    const link = await screen.findByText(/Zur Startseite/);

    fireEvent.click(link);

    expect(history.replace).toHaveBeenCalledWith('/');
  });
});
