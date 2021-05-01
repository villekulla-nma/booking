import type { FC } from 'react';
import { Redirect } from 'react-router-dom';

export const AdminStartPage: FC = () => {
  return <Redirect to="/admin/users" />;
};
