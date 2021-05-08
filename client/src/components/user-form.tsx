import type { FC } from 'react';
import { useState } from 'react';
import {
  TextField,
  Dropdown,
  Spinner,
  SpinnerSize,
  MessageBarType,
} from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import type { UserRole, GroupAttributes } from '@booking/types';

import type { ResponseStatus } from '../api';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';
import { getAllGroups } from '../api';
import { Form } from './form';
import { Feedback } from '../components/feedback';

export interface FormValues {
  userId?: string | undefined;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole | undefined;
  groupId?: string | undefined;
}

interface Props extends FormValues {
  feedback: ResponseStatus | undefined;
  formLabel: string;
  onSubmit: (values: FormValues) => void;
  onReset: () => void;
}

interface FeedbackProps {
  feedback: ResponseStatus | undefined;
}
const feedbackStyles = mergeStyles({
  marginBottom: '16px',
});

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

export const UserForm: FC<Props> = ({
  email: initialEmail,
  feedback,
  firstName: initialFirstName,
  formLabel,
  groupId: initialGroupId,
  lastName: initialLastName,
  role: initialRole,
  userId,
  onReset,
  onSubmit,
}) => {
  const [groupList] = useAuthenticatedFetch<GroupAttributes[]>(
    getAllGroups,
    []
  );
  const [firstName, setFirstName] = useState<string>(initialFirstName);
  const [lastName, setLastName] = useState<string>(initialLastName);
  const [email, setEmail] = useState<string>(initialEmail);
  const [role, setRole] = useState<UserRole | undefined>(initialRole);
  const [groupId, setGroupId] = useState<string | undefined>(initialGroupId);

  const handleFirstNameChange = (_: unknown, value = ''): void =>
    setFirstName(value);
  const handleLastNameChange = (_: unknown, value = ''): void =>
    setLastName(value);
  const handleEmailChange = (_: unknown, value = ''): void => setEmail(value);
  const handleGroupChange = (_: unknown, option?: IDropdownOption): void =>
    setGroupId(option?.id);
  const handleRoleChange = (_: unknown, option?: IDropdownOption): void =>
    setRole(option?.id as UserRole | undefined);
  const handleReset = (): void => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole(undefined);
    setGroupId(undefined);
    onReset();
  };
  const handleSubmit = (): void =>
    onSubmit({
      userId,
      firstName,
      lastName,
      email,
      role,
      groupId,
    });

  return groupList.length === 0 ? (
    <Spinner
      label="Lade Gruppen …"
      ariaLive="assertive"
      labelPosition="right"
      size={SpinnerSize.large}
    />
  ) : (
    <>
      <UserFeedback feedback={feedback} />
      <Form label={formLabel} onSubmit={handleSubmit} onReset={handleReset}>
        <TextField
          label="Vorname"
          required={true}
          value={firstName}
          onChange={handleFirstNameChange}
        />
        <TextField
          label="Nachname"
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
          label="Rolle"
          required={true}
          onChange={handleRoleChange}
          data-testid="role-select"
        />
        <Dropdown
          options={toDropDownOptions(groupList, groupId)}
          label="Gruppen"
          required={true}
          onChange={handleGroupChange}
          data-testid="group-select"
          disabled={groupList.length === 0}
        />
      </Form>
    </>
  );
};
