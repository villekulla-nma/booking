import { useState, useEffect } from 'react';
import type { User } from '@villekulla-reservations/types';

import { getUser } from '../api';

export const useUser = (): User | null | undefined => {
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    getUser().then((result) => setUser(result || null));
  }, []);

  return user;
};
