import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Stack, TextField, PrimaryButton } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { useResourceList } from '../hooks/use-resource-list';
import { SimpleAdminList } from '../components/simple-admin-list';
import { Overlay } from '../components/overlay';
import { Form } from '../components/form';
import { createResource, deleteResource } from '../api';
import { inquireConfirmation } from '../helpers/inquire-confirmation';

const formTokens: IStackTokens = {
  childrenGap: '16px',
};

export const AdminResourcesPage: FC = () => {
  const [resourceList, reloadResourceList] = useResourceList();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const handleDelete = (resourceId: string) => {
    if (inquireConfirmation('Are you sure?')) {
      deleteResource(resourceId).then((success) => {
        if (!success) {
          alert('Something went wrong.');
          return;
        }
        reloadResourceList();
      });
    }
  };
  const handleEdit = (resourceId: string) => {
    const { name: resourceName } =
      resourceList.find(({ id }) => resourceId === id) || {};

    if (resourceName) {
      setEditId(resourceId);
      setEditName(resourceName);
      setShowForm(true);
    }
  };
  const resetEditForm = () => {
    setEditName('');
    setShowForm(false);
  };
  const handleEditSubmit = () => {
    // TODO: implement API endpoint
    console.log('Edit resource', editName, editId);
    resetEditForm();
  };
  const handleEditChange = (_: unknown, value?: string) =>
    setEditName(value || '');
  const handleCreateChange = (_: unknown, value?: string) =>
    setNewName(value || '');
  const handleCreateSubmit = (event: FormEvent): void => {
    event.preventDefault();

    createResource(newName).then((status) => {
      if (status === 'ok') {
        setNewName('');
        reloadResourceList();
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
            label="Edit resource"
            onSubmit={handleEditSubmit}
            onReset={resetEditForm}
          >
            <TextField
              label="Resource name"
              required={true}
              value={editName}
              onChange={handleEditChange}
            />
          </Form>
        </Overlay>
        <form method="post" onSubmit={handleCreateSubmit}>
          <Stack horizontal={true} verticalAlign="end" tokens={formTokens}>
            <TextField
              label="Create new resource"
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
          items={resourceList}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </AdminLayout>
    </Layout>
  );
};
