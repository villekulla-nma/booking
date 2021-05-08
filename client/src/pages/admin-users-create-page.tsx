import type { FC } from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { createUser } from '../api';
import type { ResponseStatus } from '../api';
import { UserForm } from '../components/user-form';
import type { FormValues } from '../components/user-form';

export const AdminUsersCreatePage: FC = () => {
  const history = useHistory();
  const [feedback, setFeedback] = useState<ResponseStatus | undefined>();
  const goToUsersPage = (): void => history.push('/admin/users');
  const handleSubmit = ({
    firstName,
    lastName,
    email,
    role,
    groupId,
  }: FormValues): void => {
    if (typeof role === 'undefined' || typeof groupId === 'undefined') {
      setFeedback('invalid');
      return;
    }

    createUser(firstName, lastName, email, role, groupId).then((status) => {
      setFeedback(status);

      if (status === 'ok') {
        goToUsersPage();
      }
    });
  };

  return (
    <Layout>
      <AdminLayout>
        <UserForm
          feedback={feedback}
          formLabel="Nutzer anlegen"
          firstName=""
          lastName=""
          email=""
          onSubmit={handleSubmit}
          onReset={goToUsersPage}
        />
      </AdminLayout>
    </Layout>
  );
};
