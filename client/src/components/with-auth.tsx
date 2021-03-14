import type { FC, ReactElement } from 'react';

import { useSessionChecker } from '../hooks/use-session-checker';

interface Props {
  loginPage: ReactElement;
}

export const WithAuth: FC<Props> = ({ loginPage, children }) => {
  const hasValidSession = useSessionChecker();

  if (typeof hasValidSession === 'undefined') {
    return null;
  }

  if (hasValidSession) {
    return <>{children}</>;
  }

  return loginPage;
};
