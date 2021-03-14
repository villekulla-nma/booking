import type { FC } from 'react';

import { logout } from '../api';

export const LogoutButton: FC = () => {
  const handleClick = () => {
    logout().then(() => window.location.reload());
  };

  return <button onClick={handleClick}>Abmelden</button>;
};
