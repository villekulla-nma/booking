import { useState, useEffect } from 'react';
import type { ResourceAttributes } from '@villekulla-reservations/types';

import { getResources } from '../api';
import { useUserContext } from './use-user-context';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

export const useResourceList = (): ResourceAttributes[] => {
  const redirect = useRedirectUnauthenticatedUser();
  const user = useUserContext();
  const [list, setList] = useState<ResourceAttributes[]>([]);

  useEffect(() => {
    if (user) {
      getResources().then(
        (resourceList) => setList(resourceList),
        (error) => redirect(error)
      );
    }
  }, [user, redirect]);

  return list;
};
