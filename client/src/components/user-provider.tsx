import type { FC } from 'react';

import { UserContext } from '../contexts/user-context';
import { useUser } from '../hooks/use-user';

export const UserProvider: FC = ({ children }) => {
  const user = useUser();

  if (typeof user === 'undefined') {
    return null;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
