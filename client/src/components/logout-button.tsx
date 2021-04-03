import type { FC } from 'react';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';
import { reload } from '../helpers/location';
import { useUserContext } from '../hooks/use-user-context';

export const LogoutButton: FC = () => {
  const user = useUserContext();
  const handleClick = () => {
    logout().then(() => reload());
  };

  if (!user) {
    return null;
  }

  return <PrimaryButton onClick={handleClick}>Abmelden</PrimaryButton>;
};
