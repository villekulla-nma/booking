import { useContext } from 'react';
import type { User } from '@villekulla-reservations/types';

import { UserContext } from '../contexts/user-context';
import { isUser } from '../helpers/is-user';

export const useUserContext = (): User | undefined => {
  const user = useContext(UserContext);

  return isUser(user) ? user : undefined;
};
