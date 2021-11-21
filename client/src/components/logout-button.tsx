import { memo, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '@fluentui/react';

import { logout } from '../api';
import { reload } from '../helpers/location';
import { useUserContext } from '../hooks/use-user-context';

export const LogoutButton: FC = memo(() => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const user = useUserContext();
  const handleClick = () => {
    setLoading(true);

    logout().then(() => {
      navigate('/', { replace: true });
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
