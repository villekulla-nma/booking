import type { FC } from 'react';
import { Navigate } from 'react-router-dom';

export const AdminStartPage: FC = () => {
  return <Navigate to="/admin/users" />;
};
