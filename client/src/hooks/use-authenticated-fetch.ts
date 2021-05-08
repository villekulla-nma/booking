import { useState, useEffect } from 'react';

import { useUserContext } from './use-user-context';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

type Reload = () => void;

export const useAuthenticatedFetch = <Data, Default extends Data = Data>(
  fn: () => Promise<Data>,
  defaultData: Default
): [Data | Default, Reload] => {
  const redirect = useRedirectUnauthenticatedUser();
  const user = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Data | undefined>();

  useEffect(() => {
    if (user && loading === false && typeof data === 'undefined') {
      setLoading(true);

      fn()
        .then(
          (result): [Data, undefined] => [result, undefined],
          (error: Error): [undefined, Error] => [undefined, error]
        )
        .then(([result, error]) => {
          if (result) {
            setData(result);
          } else if (error) {
            redirect(error);
          } else {
            setData(defaultData);
          }

          setLoading(false);
        });
    }
  }, [fn, user, data, setData, loading, setLoading, defaultData, redirect]);

  return [data || defaultData, () => setData(undefined)];
};
