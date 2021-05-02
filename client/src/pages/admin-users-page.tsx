import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  ActionButton,
  TextField,
  Dropdown,
  MessageBarType,
} from '@fluentui/react';
import type { IIconProps, IDropdownOption } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import { UserResponse, GroupAttributes, UserRole } from '@booking/types';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { getAllUsers, createUser, deleteUser } from '../api';
import type { ResponseStatus } from '../api';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { Overlay } from '../components/overlay';
import { useGroupList } from '../hooks/use-group-list';
import { SimpleAdminList } from '../components/simple-admin-list';
import type { SimplAdminListItem } from '../components/simple-admin-list';
import { inquireConfirmation } from '../helpers/inquire-confirmation';

interface FeedbackProps {
  feedback: ResponseStatus | undefined;
}

const feedbackStyles = mergeStyles({
  marginBottom: '16px',
});

const actionButtonIcon: IIconProps = { iconName: 'AddFriend' };

const toListItems = (users: UserResponse[]): SimplAdminListItem[] =>
  users.map(({ id, fullName, role }) => ({
    name: `${fullName} [${role}]`,
    id,
  }));

const toDropDownOptions = (
  groups: GroupAttributes[],
  current: string | undefined
): IDropdownOption[] =>
  groups.map(({ id, name }) => ({
    key: id,
    text: name,
    selected: id === current,
    id,
  }));

const getRoleOptions = (current: UserRole | undefined): IDropdownOption[] => [
  {
    key: 'user',
    id: 'user',
    text: 'User',
    selected: current === 'user',
  },
  {
    key: 'admin',
    id: 'admin',
    text: 'Admin',
    selected: current === 'admin',
  },
];

const UserFeedback: FC<FeedbackProps> = ({ feedback }) => {
  if (!feedback || feedback === 'ok') {
    return null;
  }

  let message: string;
  let type: MessageBarType;

  switch (feedback) {
    case 'invalid':
      message = 'Eine oder mehrere Angaben stimmen nicht.';
      type = MessageBarType.warning;
      break;
    case 'error':
      message = 'Ein Fehler ist aufgetreten. Bitte versuch es noch einmal.';
      type = MessageBarType.error;
      break;
    case 'overlapping':
    case 'unverified':
      throw new Error(`Unexpected type "${feedback}".`);
    default:
      throw new Error(`Unknown type "${feedback}".`);
  }

  return (
    <Feedback type={type} className={feedbackStyles}>
      {message}
    </Feedback>
  );
};

export const AdminUsersPage: FC = () => {
  const groupList = useGroupList();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole | undefined>();
  const [groupId, setGroupId] = useState<string | undefined>();
  const [users, setUsers] = useState<UserResponse[] | undefined>();
  const [feedback, setFeedback] = useState<ResponseStatus | undefined>();
  const showFormHandler = (): void => setShowForm(true);
  const handleFirstNameChange = (_: unknown, value = ''): void =>
    setFirstName(value);
  const handleLastNameChange = (_: unknown, value = ''): void =>
    setLastName(value);
  const handleEmailChange = (_: unknown, value = ''): void => setEmail(value);
  const handleGroupChange = (_: unknown, option?: IDropdownOption): void =>
    setGroupId(option?.id);
  const handleRoleChange = (_: unknown, option?: IDropdownOption): void =>
    setRole(option?.id as UserRole | undefined);
  const resetForm = (): void => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setFeedback(undefined);
    setShowForm(false);
  };
  const handleSubmit = (): void => {
    if (typeof role === 'undefined' || typeof groupId === 'undefined') {
      setFeedback('invalid');
      return;
    }

    createUser(firstName, lastName, email, role, groupId).then((status) => {
      setFeedback(status);

      if (status === 'ok') {
        resetForm();
        setUsers(undefined);
      }
    });
  };
  const handleUserDeletion = (userId: string): void => {
    if (inquireConfirmation('Are you sure?')) {
      deleteUser(userId).then((success) => {
        if (success) {
          setUsers(undefined);
        } else {
          alert('Something went wrong.');
        }
      });
    }
  };

  useEffect(() => {
    if (typeof users === 'undefined') {
      getAllUsers().then((users) => setUsers(users));
    }
  }, [users]);

  return (
    <Layout>
      <AdminLayout>
        <Overlay visible={showForm}>
          <UserFeedback feedback={feedback} />
          <Form
            label="Create new user…"
            buttonLabel="Create"
            onSubmit={handleSubmit}
            onReset={resetForm}
          >
            <TextField
              label="First name"
              required={true}
              value={firstName}
              onChange={handleFirstNameChange}
            />
            <TextField
              label="Last name"
              required={true}
              value={lastName}
              onChange={handleLastNameChange}
            />
            <TextField
              label="Email"
              type="email"
              required={true}
              value={email}
              onChange={handleEmailChange}
            />
            <Dropdown
              options={getRoleOptions(role)}
              label="Role"
              required={true}
              onChange={handleRoleChange}
              data-testid="role-select"
            />
            <Dropdown
              options={toDropDownOptions(groupList, groupId)}
              label="Group"
              required={true}
              onChange={handleGroupChange}
              data-testid="group-select"
            />
          </Form>
        </Overlay>
        <ActionButton onClick={showFormHandler} iconProps={actionButtonIcon}>
          Create new user
        </ActionButton>
        <SimpleAdminList
          items={toListItems(users || [])}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={handleUserDeletion}
        />
      </AdminLayout>
    </Layout>
  );
};
