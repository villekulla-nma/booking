import { memo, useState } from 'react';
import type { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';
import { reload } from '../helpers/location';
import { useUserContext } from '../hooks/use-user-context';

export const LogoutButton: FC = memo(() => {
  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();
  const user = useUserContext();
  const handleClick = () => {
    setLoading(true);

    logout().then(() => {
      history.replace('/', {});
      reload();
    });
  };

  if (!user) {
    return null;
  }

  return (
    <PrimaryButton onClick={handleClick} disabled={loading}>
      Abmelden
    </PrimaryButton>
  );
});
