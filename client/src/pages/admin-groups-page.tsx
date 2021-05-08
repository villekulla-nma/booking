import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import {
  Stack,
  TextField,
  PrimaryButton,
  MessageBarType,
} from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import type { GroupAttributes } from '@booking/types';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';
import { SimpleAdminList } from '../components/simple-admin-list';
import { Overlay } from '../components/overlay';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { getAllGroups, createGroup, updateGroup, deleteGroup } from '../api';
import type { ResponseStatus } from '../api';
import { inquireConfirmation } from '../helpers/inquire-confirmation';

interface FeedbackProps {
  feedback: ResponseStatus | undefined;
}

const formTokens: IStackTokens = {
  childrenGap: '16px',
};

const feedbackStyles = mergeStyles({
  marginBottom: '16px',
});

const UserFeedback: FC<FeedbackProps> = ({ feedback }) => {
  if (!feedback || feedback === 'ok') {
    return null;
  }

  let message: string;
  let type: MessageBarType;

  switch (feedback) {
    case 'invalid':
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

export const AdminGroupsPage: FC = () => {
  const [groupList, reloadGroupList] = useAuthenticatedFetch<GroupAttributes[]>(
    getAllGroups,
    []
  );
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const [feedback, setFeedback] = useState<ResponseStatus | undefined>();
  const handleDelete = (groupId: string) => {
    if (inquireConfirmation('Are you sure?')) {
      deleteGroup(groupId).then((success) => {
        if (!success) {
          alert('Something went wrong.');
          return;
        }
        reloadGroupList();
      });
    }
  };
  const handleEdit = (groupId: string) => {
    const { name: groupName } =
      groupList.find(({ id }) => groupId === id) || {};

    if (groupName) {
      setEditId(groupId);
      setEditName(groupName);
      setShowForm(true);
    }
  };
  const resetEditForm = () => {
    setEditName('');
    setShowForm(false);
  };
  const handleEditSubmit = () => {
    updateGroup(editId, editName).then((status) => {
      setFeedback(status);

      if (status === 'ok') {
        resetEditForm();
        requestAnimationFrame(() => reloadGroupList());
      }
    });
  };
  const handleEditChange = (_: unknown, value?: string) =>
    setEditName(value || '');
  const handleCreateChange = (_: unknown, value?: string) =>
    setNewName(value || '');
  const handleCreateSubmit = (event: FormEvent): void => {
    event.preventDefault();

    createGroup(newName).then((status) => {
      if (status === 'ok') {
        setNewName('');
        reloadGroupList();
      } else {
        alert('Something went wrong.');
      }
    });
  };

  return (
    <Layout>
      <AdminLayout>
        <Overlay visible={showForm}>
          <UserFeedback feedback={feedback} />
          <Form
            label="Edit group…"
            onSubmit={handleEditSubmit}
            onReset={resetEditForm}
          >
            <TextField
              label="Group name"
              required={true}
              value={editName}
              onChange={handleEditChange}
            />
          </Form>
        </Overlay>
        <form method="post" onSubmit={handleCreateSubmit}>
          <Stack horizontal={true} verticalAlign="end" tokens={formTokens}>
            <TextField
              label="Create new group…"
              value={newName}
              required={true}
              onChange={handleCreateChange}
            />
            <PrimaryButton disabled={newName === ''} type="submit">
              Create
            </PrimaryButton>
          </Stack>
        </form>
        <SimpleAdminList
          items={groupList}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </AdminLayout>
    </Layout>
  );
};
