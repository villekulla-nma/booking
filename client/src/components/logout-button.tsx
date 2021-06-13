import { memo } from 'react';
import type { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';
import { reload } from '../helpers/location';
import { useUserContext } from '../hooks/use-user-context';

export const LogoutButton: FC = memo(() => {
  const history = useHistory();
  const user = useUserContext();
  const handleClick = () => {
    logout().then(() => {
      history.replace('/', {});
      reload();
    });
  };

  if (!user) {
    return null;
  }

  return <PrimaryButton onClick={handleClick}>Abmelden</PrimaryButton>;
});
