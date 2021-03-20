import type { FC, ComponentType } from 'react';
import type { RouteProps } from 'react-router-dom';
import { Route, Redirect } from 'react-router-dom';
import type { User } from '@villekulla-reservations/types';

import { useUser } from '../hooks/use-user';
import { UserContext } from '../contexts/user-context';

const { Provider: UserProvider } = UserContext;

export const PrivateRoute: FC<RouteProps> = ({ component, ...rest }) => {
  const user = useUser();
  const from = `${window.location.pathname}${window.location.search}`;

  return (
    <Route
      {...rest}
      render={() => {
        switch (true) {
          case typeof user === 'undefined':
            return null;
          case user === null:
            return (
              <Redirect
                to={{
                  pathname: '/login',
                  state: { from },
                }}
              />
            );
          default:
            const Comp = component as ComponentType<unknown>;
            return (
              <UserProvider value={user as User}>
                <Comp />
              </UserProvider>
            );
        }
      }}
    />
  );
};
