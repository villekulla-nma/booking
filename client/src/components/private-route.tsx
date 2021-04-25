import type { FC, ComponentType } from 'react';
import type { RouteProps } from 'react-router-dom';
import { Route, Redirect, useLocation } from 'react-router-dom';

import { useUserContext } from '../hooks/use-user-context';
import { isAuthorized } from '../helpers/is-authorized';
import { ROLE } from '../constants';

type Props = RouteProps & {
  role?: ROLE;
};

export const PrivateRoute: FC<Props> = ({
  role = ROLE.USER,
  component,
  ...rest
}) => {
  const user = useUserContext();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const Comp = component as ComponentType<unknown>;
  const userIsAuthorized = isAuthorized(role, user?.role as ROLE | undefined);

  return (
    <Route
      {...rest}
      render={() => {
        switch (true) {
          case user === null:
            return (
              <Redirect
                to={{
                  pathname: '/login',
                  state: { from },
                }}
              />
            );
          case typeof userIsAuthorized === 'undefined':
            return null;
          case userIsAuthorized === false:
            if (location.pathname !== '/') {
              return <Redirect to="/" push={false} />;
            } else {
              console.warn('Please do not limit resource / to admins!');
            }
            break;
          default:
            return <Comp />;
        }
      }}
    />
  );
};
