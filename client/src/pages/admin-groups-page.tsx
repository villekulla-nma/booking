import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Stack, TextField, PrimaryButton } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { useGroupList } from '../hooks/use-group-list';
import { SimpleAdminList } from '../components/simple-admin-list';
import { Overlay } from '../components/overlay';
import { Form } from '../components/form';
import { createGroup, deleteGroup } from '../api';
import { inquireConfirmation } from '../helpers/inquire-confirmation';

const formTokens: IStackTokens = {
  childrenGap: '16px',
};

export const AdminGroupsPage: FC = () => {
  const [groupList, reloadGroupList] = useGroupList();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
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
    // TODO: implement API endpoint
    console.log('Edit group', editName, editId);
    resetEditForm();
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
