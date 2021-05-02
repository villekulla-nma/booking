import { useState, useEffect } from 'react';
import type { ResourceAttributes } from '@booking/types';

import { getAllResources } from '../api';
import { useUserContext } from './use-user-context';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

type ReloadResourcesList = () => void;

export const useResourceList = (): [
  ResourceAttributes[],
  ReloadResourcesList
] => {
  const redirect = useRedirectUnauthenticatedUser();
  const user = useUserContext();
  const [resources, setResources] = useState<
    ResourceAttributes[] | undefined
  >();

  useEffect(() => {
    if (user && typeof resources === 'undefined') {
      getAllResources().then(
        (resourceList) => setResources(resourceList),
        (error) => redirect(error)
      );
    }
  }, [resources, user, redirect]);

  return [resources || [], () => setResources(undefined)];
};
