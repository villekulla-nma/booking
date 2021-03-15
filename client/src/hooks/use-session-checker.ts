import { useState, useEffect } from 'react';
import type { User } from '@villekulla-reservations/types';

import { verifySession } from '../api';

export const useSessionChecker = (): User | undefined => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    verifySession().then((result) => setUser(result));
  }, []);

  return user;
};
