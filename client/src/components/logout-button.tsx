import type { FC } from 'react';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';
import { useUser } from '../hooks/use-user';

export const LogoutButton: FC = () => {
  const user = useUser();
  const handleClick = () => {
    logout().then(() => window.location.reload());
  };

  if (!user) {
    return null;
  }

  return <PrimaryButton onClick={handleClick}>Abmelden</PrimaryButton>;
};
