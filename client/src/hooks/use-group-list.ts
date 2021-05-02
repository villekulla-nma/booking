import { useState, useEffect } from 'react';
import type { GroupAttributes } from '@booking/types';

import { getAllGroups } from '../api';
import { useUserContext } from './use-user-context';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

type ReloadGroupList = () => void;

export const useGroupList = (): [GroupAttributes[], ReloadGroupList] => {
  const redirect = useRedirectUnauthenticatedUser();
  const user = useUserContext();
  const [groups, setGroups] = useState<GroupAttributes[] | undefined>();

  useEffect(() => {
    if (user && typeof groups === 'undefined') {
      getAllGroups()
        .then(
          (groupList) => setGroups(groupList),
          (error) => redirect(error)
        )
        .catch(console.error);
    }
  }, [groups, user, redirect]);

  return [groups || [], () => setGroups(undefined)];
};
