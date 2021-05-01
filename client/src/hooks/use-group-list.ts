import { useState, useEffect } from 'react';
import type { GroupAttributes } from '@booking/types';

import { getAllGroups } from '../api';
import { useUserContext } from './use-user-context';
import { useRedirectUnauthenticatedUser } from './use-redirect-unauthenticated-user';

export const useGroupList = (): GroupAttributes[] => {
  const redirect = useRedirectUnauthenticatedUser();
  const user = useUserContext();
  const [group, setGroup] = useState<GroupAttributes[]>([]);

  useEffect(() => {
    if (user) {
      getAllGroups()
        .then(
          (groupList) => setGroup(groupList),
          (error) => redirect(error)
        )
        .catch(console.error);
    }
  }, [user, redirect]);

  return group;
};
