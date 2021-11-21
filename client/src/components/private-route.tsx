import type { FC, ComponentType } from 'react';
import type { RouteProps } from 'react-router-dom';
import { Route, Navigate, useLocation } from 'react-router-dom';

import { useUserContext } from '../hooks/use-user-context';
import { isAuthorized } from '../helpers/is-authorized';
import { ROLE } from '../constants';

type Props = RouteProps & {
  role?: ROLE;
};

// TODO: add test
export const PrivateRoute: FC<Props> = ({
  role = ROLE.USER,
  children,
  ...rest
}) => {
  const user = useUserContext();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const Comp = children as ComponentType<unknown>;
  const userIsAuthorized = isAuthorized(role, user?.role as ROLE | undefined);

  return (
    <Route
      {...rest}
      children={() => {
        switch (true) {
          case user === null:
            return <Navigate to="/login" state={{ from }} replace={true} />;
          case typeof userIsAuthorized === 'undefined':
            return null;
          case userIsAuthorized === false:
            if (location.pathname !== '/') {
              return <Navigate to="/" />;
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
