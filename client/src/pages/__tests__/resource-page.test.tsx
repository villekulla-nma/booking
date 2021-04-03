import type { FC } from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { ResourcePage } from '../resource-page';
import { useMediaQuery } from '../../hooks/use-media-query';
import { scopeIsDone } from '../../helpers/nock';

jest.mock('../../components/layout.tsx', () => {
  const Layout: FC = ({ children }) => <>{children}</>;
  return { Layout };
});

jest.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(),
}));

describe('Resource Page', () => {
  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  it('should render the calendar somehow...', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    const resourceId = 'Uj5SAS740';
    const date = new Date(Date.now() + 24 * 3600 * 1000);
    const [tomorrow] = date.toISOString().split('T');
    const [year] = date.toISOString().split('-');
    const scope = nock('http://localhost')
      .get(`/api/resources/${resourceId}/events`)
      .query(
        ({ start, end, timeZone, ...rest }) =>
          (start as string).startsWith(year) &&
          (end as string).startsWith(year) &&
          (timeZone as string).length > 0 &&
          Object.keys(rest).length === 0
      )
      .reply(200, []);

    render(
      <Router initialEntries={[`/resources/${resourceId}/week/${tomorrow}`]}>
        <Route
          path="/resources/:resourceId/:view/:now"
          component={ResourcePage}
        />
      </Router>
    );
    const button = screen
      .getByText('Reservieren')
      .closest('button') as HTMLButtonElement;

    await expect(scopeIsDone(scope)).resolves.toBe(true);
    expect(button.disabled).toBe(true);
  });
});
