import { useState, useEffect } from 'react';
import type { ResourceAttributes } from '@villekulla-reservations/types';

import { getResources } from '../api';
import { useUser } from './use-user';

export const useResourceList = (): ResourceAttributes[] => {
  const user = useUser();
  const [list, setList] = useState<ResourceAttributes[]>([]);

  useEffect(() => {
    if (user) {
      getResources().then((resourceList) => setList(resourceList));
    }
  }, [user]);

  return list;
};
