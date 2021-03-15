import type { FC, ReactElement } from 'react';

import { useSessionChecker } from '../hooks/use-session-checker';
import { UserContext } from '../contexts/user-context';

interface Props {
  loginPage: ReactElement;
}

const { Provider: UserProvider } = UserContext;

export const WithAuth: FC<Props> = ({ loginPage, children }) => {
  const user = useSessionChecker();

  if (typeof user === 'undefined') {
    return null;
  }

  if (user) {
    return <UserProvider value={user}>{children}</UserProvider>;
  }

  return loginPage;
};
