import type { FC } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { NotFoundPage } from '../not-found-page';

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

describe('Not Found Page', () => {
  initializeIcons();

  it('should remove leading slashes', async () => {
    const pathname = `/some/page`;
    let visited = false;

    render(
      <Router initialEntries={[`${pathname}/`]}>
        <Switch>
          <Route
            path={pathname}
            exact={true}
            strict={true}
            render={() => {
              visited = true;
              return null;
            }}
          />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </Router>
    );

    expect(visited).toBe(true);
  });

  it('should display the Not Found page', () => {
    const pathname = `/some/page`;

    render(
      <Router initialEntries={['/where/am/i']}>
        <Switch>
          <Route
            path={pathname}
            exact={true}
            strict={true}
            render={() => {
              return <h2>I am a real page!!</h2>;
            }}
          />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </Router>
    );

    screen.getByText('Hier gibt es leider nichts.');

    const link = screen.getByText('Zur Startseite') as HTMLAnchorElement;
    const { pathname: href } = new URL(link.href);

    expect(href).toBe('/');
  });
});
