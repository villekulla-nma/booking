import type { FC } from 'react';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';

export const LogoutButton: FC = () => {
  const handleClick = () => {
    logout().then(() => window.location.reload());
  };

  return <PrimaryButton onClick={handleClick}>Abmelden</PrimaryButton>;
};
