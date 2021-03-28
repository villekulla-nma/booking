import type { FC } from 'react';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';
import { useUser } from '../hooks/use-user';
import { reload } from '../helpers/location';

export const LogoutButton: FC = () => {
  const user = useUser();
  const handleClick = () => {
    logout().then(() => reload());
  };

  if (!user) {
    return null;
  }

  return <PrimaryButton onClick={handleClick}>Abmelden</PrimaryButton>;
};
