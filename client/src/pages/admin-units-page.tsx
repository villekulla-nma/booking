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
import type { UnitAttributes } from '@booking/types';

import { Layout } from '../components/layout';
import { AdminLayout } from '../components/admin-layout';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';
import { SimpleAdminList } from '../components/simple-admin-list';
import { Overlay } from '../components/overlay';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { getAllUnits, createUnit, updateUnit, deleteUnit } from '../api';
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

export const AdminUnitsPage: FC = () => {
  const [unitList, reloadUnitList] = useAuthenticatedFetch<UnitAttributes[]>(
    getAllUnits,
    []
  );
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const [feedback, setFeedback] = useState<ResponseStatus | undefined>();
  const handleDelete = (unitId: string) => {
    if (inquireConfirmation('Are you sure?')) {
      deleteUnit(unitId).then((success) => {
        if (!success) {
          alert('Something went wrong.');
          return;
        }
        reloadUnitList();
      });
    }
  };
  const handleEdit = (unitId: string) => {
    const { name: unitName } = unitList.find(({ id }) => unitId === id) || {};

    if (unitName) {
      setEditId(unitId);
      setEditName(unitName);
      setShowForm(true);
    }
  };
  const resetEditForm = () => {
    setEditName('');
    setShowForm(false);
  };
  const handleEditSubmit = () => {
    updateUnit(editId, editName).then((status) => {
      setFeedback(status);

      if (status === 'ok') {
        resetEditForm();
        requestAnimationFrame(() => reloadUnitList());
      }
    });
  };
  const handleEditChange = (_: unknown, value?: string) =>
    setEditName(value || '');
  const handleCreateChange = (_: unknown, value?: string) =>
    setNewName(value || '');
  const handleCreateSubmit = (event: FormEvent): void => {
    event.preventDefault();

    createUnit(newName).then((status) => {
      if (status === 'ok') {
        setNewName('');
        reloadUnitList();
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
            label="Edit unit…"
            onSubmit={handleEditSubmit}
            onReset={resetEditForm}
          >
            <TextField
              label="Unit name"
              required={true}
              value={editName}
              name="unit"
              onChange={handleEditChange}
            />
          </Form>
        </Overlay>
        <form method="post" onSubmit={handleCreateSubmit}>
          <Stack horizontal={true} verticalAlign="end" tokens={formTokens}>
            <TextField
              label="Create new unit…"
              value={newName}
              required={true}
              name="unit"
              onChange={handleCreateChange}
            />
            <PrimaryButton disabled={newName === ''} type="submit">
              Create
            </PrimaryButton>
          </Stack>
        </form>
        <SimpleAdminList
          items={unitList}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </AdminLayout>
    </Layout>
  );
};
