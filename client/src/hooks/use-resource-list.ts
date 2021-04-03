import { useState, useEffect } from 'react';
import type { ResourceAttributes } from '@villekulla-reservations/types';

import { getResources } from '../api';
import { useUserContext } from './use-user-context';

export const useResourceList = (): ResourceAttributes[] => {
  const user = useUserContext();
  const [list, setList] = useState<ResourceAttributes[]>([]);

  useEffect(() => {
    if (user) {
      getResources().then((resourceList) => setList(resourceList));
    }
  }, [user]);

  return list;
};
