import { useState, useEffect } from 'react';
import type { User } from '@villekulla-reservations/types';

import { verifySession } from '../api';

export const useSessionChecker = (): User | null | undefined => {
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    verifySession().then((result) => setUser(result || null));
  }, []);

  return user;
};
