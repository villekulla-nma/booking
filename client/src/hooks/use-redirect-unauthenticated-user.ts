import { useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Location } from 'history';

import { UnauthenticatedError } from '../api';

type IsRedirecting = boolean;

type RedirectFn = (
  error: unknown,
  fn?: (error: Error | unknown) => void
) => IsRedirecting;

export const useRedirectUnauthenticatedUser = (): RedirectFn => {
  const navigate = useNavigate();
  const initialLocation = useLocation();
  const location = useRef<Location>(initialLocation);
  const redirectFn = useCallback<RedirectFn>(
    (error, fn): IsRedirecting => {
      if (error instanceof UnauthenticatedError) {
        const from = `${location.current.pathname}${location.current.search}`;

        navigate('/login', {
          replace: true,
          state: location.current.state || { from },
        });
        return true;
      } else {
        if (typeof fn === 'function') {
          fn(error);
          return false;
        } else {
          throw error;
        }
      }
    },
    [location, navigate]
  );
  const redirect = useRef<RedirectFn>(redirectFn);

  useEffect(() => {
    location.current = initialLocation;
  }, [initialLocation]);

  return redirect.current;
};
