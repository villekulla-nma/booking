import type { FC, ComponentType } from 'react';
import type { RouteProps } from 'react-router-dom';
import { Route, Redirect, useLocation } from 'react-router-dom';

import { useUserContext } from '../hooks/use-user-context';

export const PrivateRoute: FC<RouteProps> = ({ component, ...rest }) => {
  const user = useUserContext();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const Comp = component as ComponentType<unknown>;

  return (
    <Route
      {...rest}
      render={() => {
        if (user === null) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from },
              }}
            />
          );
        }

        return <Comp />;
      }}
    />
  );
};
