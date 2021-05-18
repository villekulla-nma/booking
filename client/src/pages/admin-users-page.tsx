import type { FC } from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ActionButton } from '@fluentui/react';
import type { IIconProps } from '@fluentui/react';
import { UserResponse } from '@booking/types';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { getAllUsers, updateUser, deleteUser } from '../api';
import type { ResponseStatus } from '../api';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';
import { UserForm } from '../components/user-form';
import type { FormValues } from '../components/user-form';
import { Overlay } from '../components/overlay';
import { SimpleAdminList } from '../components/simple-admin-list';
import type { SimplAdminListItem } from '../components/simple-admin-list';
import { inquireConfirmation } from '../helpers/inquire-confirmation';

const actionButtonIcon: IIconProps = { iconName: 'AddFriend' };

const toListItems = (users: UserResponse[]): SimplAdminListItem[] =>
  users.map(({ id, fullName, role }) => ({
    name: `${fullName} [${role}]`,
    id,
  }));

export const AdminUsersPage: FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<UserResponse | undefined>();
  const [users, reloadUsers] = useAuthenticatedFetch<UserResponse[]>(
    getAllUsers,
    []
  );
  const [feedback, setFeedback] = useState<ResponseStatus | undefined>();
  const handleCreateNewUser = (): void => history.push('/admin/users/create');
  const showEditFormHandler = (userId: string): void => {
    const user = (users || []).find(({ id }) => id === userId);

    if (!user) {
      return;
    }

    setUser(user);
  };
  const handleReset = (): void => {
    setUser(undefined);
    setFeedback(undefined);
  };
  const handleSubmit = ({
    firstName,
    lastName,
    email,
    role,
    unitId,
    userId,
  }: FormValues): void => {
    if (
      typeof role === 'undefined' ||
      typeof unitId === 'undefined' ||
      typeof userId === 'undefined'
    ) {
      setFeedback('invalid');
      return;
    }

    updateUser(userId, firstName, lastName, email, role, unitId).then(
      (status) => {
        setFeedback(status);

        if (status === 'ok') {
          setUser(undefined);
          reloadUsers();
        }
      }
    );
  };
  const handleUserDeletion = (userId: string): void => {
    if (inquireConfirmation('Soll das Nutzerkonto wirklich gelöscht werden?')) {
      deleteUser(userId).then((success) => {
        if (success) {
          reloadUsers();
        } else {
          alert('Etwas ist schief gelaufen.');
        }
      });
    }
  };

  return (
    <Layout>
      <AdminLayout>
        {typeof user !== 'undefined' && (
          <Overlay visible={true}>
            <UserForm
              feedback={feedback}
              formLabel="Nutzer bearbeiten…"
              userId={user.id}
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              role={user.role}
              unitId={user.unitId}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </Overlay>
        )}
        <ActionButton
          onClick={handleCreateNewUser}
          iconProps={actionButtonIcon}
        >
          Neuer Nutzer
        </ActionButton>
        <SimpleAdminList
          items={toListItems(users || [])}
          onEdit={showEditFormHandler}
          onDelete={handleUserDeletion}
        />
      </AdminLayout>
    </Layout>
  );
};
