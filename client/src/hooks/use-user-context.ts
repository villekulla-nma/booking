import { useContext } from 'react';
import type { UserResponse } from '@villekulla-reservations/types';

import { UserContext } from '../contexts/user-context';
import { isUser } from '../helpers/is-user';

export const useUserContext = (): UserResponse | null => {
  const user = useContext(UserContext);

  return isUser(user) ? user : null;
};
