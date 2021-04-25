import { useState, useEffect } from 'react';
import type { UserResponse } from '@booking/types';

import { getUser } from '../api';

// TODO: add mechanism to only fetch the data at least every five second
export const useUser = (): UserResponse | null | undefined => {
  const [user, setUser] = useState<UserResponse | null>();

  useEffect(() => {
    getUser().then((result) => setUser(result || null));
  }, []);

  return user;
};
