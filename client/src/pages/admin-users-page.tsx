import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DetailsList,
  Text,
  Icon,
  IconButton,
  ActionButton,
  TextField,
  Link as A,
  Overlay,
  Dropdown,
  DetailsListLayoutMode,
  SelectionMode,
  MessageBarType,
} from '@fluentui/react';
import type {
  IColumn,
  IDetailsListProps,
  IIconProps,
  IDropdownOption,
} from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import { UserResponse, GroupAttributes, UserRole } from '@booking/types';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { getAllUsers, createUser, deleteUser } from '../api';
import type { ResponseStatus } from '../api';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { useGroupList } from '../hooks/use-group-list';
import { inquireConfirmation } from '../helpers/inquire-confirmation';

interface FeedbackProps {
  feedback: ResponseStatus | undefined;
}

const columns: IColumn[] = [
  {
    key: 'edit',
    name: 'Edit',
    fieldName: 'edit',
    minWidth: 50,
    maxWidth: 50,
  },
  {
    key: 'delete',
    name: 'Delete',
    fieldName: 'delete',
    minWidth: 70,
    maxWidth: 70,
  },
  {
    key: 'id',
    name: 'ID',
    fieldName: 'id',
    minWidth: 80,
    maxWidth: 120,
  },
  {
    key: 'role',
    name: 'Role',
    fieldName: 'role',
    minWidth: 80,
    maxWidth: 120,
  },
  {
    key: 'name',
    name: 'Name',
    fieldName: 'name',
    minWidth: 200,
  },
];

const editLink = mergeStyles({
  height: 'auto',
  fontSize: '16px',
});

const overlay = mergeStyles({
  zIndex: 100,
});

const formWrap = mergeStyles({
  maxWidth: '400px',
  padding: '32px',
  margin: '64px auto 32px auto',
  backgroundColor: 'white',
});

const feedbackStyles = mergeStyles({
  marginBottom: '16px',
});

const deleteIcon: IIconProps = { iconName: 'Delete' };

const actionButtonIcon: IIconProps = { iconName: 'AddFriend' };

const createOnRenderItemColumn = (
  handleUserDeletion: (userId: string) => void
) => (
  item: Record<string, string>,
  _: unknown,
  column?: IColumn
): ReactNode => {
  const fieldName = column?.fieldName;

  if (fieldName === 'edit') {
    return (
      <A as={Link} to={`/admin/users/${item.id}`} className={editLink}>
        <Icon iconName="EditContact" />
      </A>
    );
  }

  if (fieldName === 'delete') {
    return (
      <IconButton
        iconProps={deleteIcon}
        className={editLink}
        onClick={() => handleUserDeletion(item.id)}
        ariaLabel="Delete user"
        data-testid={`delete-user-${item.id}`}
      />
    );
  }
  const value = !fieldName || !item[fieldName] ? '-' : item[fieldName];

  return <Text variant="medium">{value}</Text>;
};

const toListItems = (users: UserResponse[]): IDetailsListProps['items'] =>
  users.map(({ id, fullName, role }) => ({
    key: id,
    edit: '',
    name: fullName,
    role,
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
  const onRenderItemColumn = createOnRenderItemColumn(handleUserDeletion);

  useEffect(() => {
    if (typeof users === 'undefined') {
      getAllUsers().then((users) => setUsers(users));
    }
  }, [users]);

  return (
    <Layout>
      <AdminLayout>
        {showForm && (
          <Overlay
            isDarkThemed={true}
            className={overlay}
            data-testid="overlay"
          >
            <div className={formWrap}>
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
            </div>
          </Overlay>
        )}
        <ActionButton onClick={showFormHandler} iconProps={actionButtonIcon}>
          Create new user
        </ActionButton>
        <DetailsList
          items={toListItems(users || [])}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          onRenderItemColumn={onRenderItemColumn}
        />
      </AdminLayout>
    </Layout>
  );
};
