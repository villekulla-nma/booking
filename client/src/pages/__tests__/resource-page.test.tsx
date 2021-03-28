import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';

import { ResourcePage } from '../resource-page';
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

describe('Resource Page', () => {
  initializeIcons();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.restore();
  });

  it('should render the calendar somehow...', async () => {
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
    const button = screen.getByText('Reservieren').closest('button');

    await sleep(100);

    expect(button.disabled).toBe(true);
    expect(scope.isDone()).toBe(true);
  });
});
