import { useState, useEffect } from 'react';
import type { ResourceAttributes } from '@villekulla-reservations/types';

import { getResources } from '../api';

export const useResourceList = (): ResourceAttributes[] => {
  const [list, setList] = useState<ResourceAttributes[]>([]);

  useEffect(() => {
    getResources().then((resourceList) => setList(resourceList));
  }, []);

  return list;
};
