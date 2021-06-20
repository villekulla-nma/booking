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
import type { SimplAdminListItem } from '../components/simple-admin-list';
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
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
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
    const { name: unitName, color: unitColor } =
      unitList.find(({ id }) => unitId === id) || {};

    if (unitName && unitColor) {
      setEditId(unitId);
      setEditName(unitName);
      setEditColor(unitColor);
      setShowForm(true);
    }
  };
  const resetEditForm = () => {
    setEditName('');
    setShowForm(false);
  };
  const handleEditSubmit = () => {
    setEditLoading(true);

    updateUnit(editId, editName, editColor)
      .then(
        (status) => {
          setFeedback(status);

          if (status === 'ok') {
            resetEditForm();
            requestAnimationFrame(() => reloadUnitList());
          }
        },
        () => alert('Da ist leider etwas schief gelaufen.')
      )
      .finally(() => {
        setEditLoading(false);
      });
  };
  const handleEditNameChange = (_: unknown, value?: string) =>
    setEditName(value || '');
  const handleEditColorChange = (_: unknown, value?: string) =>
    setEditColor(value || '');
  const handleCreateChange = (_: unknown, value?: string) =>
    setNewName(value || '');
  const handleCreateSubmit = (event: FormEvent): void => {
    event.preventDefault();
    setCreateLoading(true);

    createUnit(newName)
      .then(
        (status) => {
          if (status === 'ok') {
            setNewName('');
            reloadUnitList();
          } else {
            alert('Something went wrong.');
          }
        },
        () => alert('Da ist leider etwas schief gelaufen.')
      )
      .finally(() => {
        setCreateLoading(false);
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
            loading={editLoading}
          >
            <TextField
              label="Unit name"
              required={true}
              value={editName}
              name="unit"
              disabled={editLoading}
              onChange={handleEditNameChange}
            />
            <TextField
              label="Unit color"
              required={true}
              value={editColor}
              name="unit"
              disabled={editLoading}
              pattern="^#[a-f0-9]{6}$"
              onChange={handleEditColorChange}
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
              disabled={createLoading}
              onChange={handleCreateChange}
            />
            <PrimaryButton
              disabled={newName === '' || createLoading}
              type="submit"
            >
              Create
            </PrimaryButton>
          </Stack>
        </form>
        <SimpleAdminList
          items={unitList.map(
            ({ id, name }): SimplAdminListItem => ({ id, name })
          )}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </AdminLayout>
    </Layout>
  );
};
