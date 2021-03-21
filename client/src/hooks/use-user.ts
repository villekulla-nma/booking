import { useState, useEffect } from 'react';
import type { UserResponse } from '@villekulla-reservations/types';

import { getUser } from '../api';

export const useUser = (): UserResponse | null | undefined => {
  const [user, setUser] = useState<UserResponse | null>();

  useEffect(() => {
    getUser().then((result) => setUser(result || null));
  }, []);

  return user;
};
