import type { FC, ReactNode } from 'react';
import {
  DetailsList,
  IconButton,
  Text,
  DetailsListLayoutMode,
  SelectionMode,
} from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import type { IDetailsListProps, IColumn, IIconProps } from '@fluentui/react';

type Handler = (userId: string) => void;

export interface SimplAdminListItem {
  id: string;
  name: string;
}

interface Props {
  items: SimplAdminListItem[];
  onEdit: Handler;
  onDelete: Handler;
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
    key: 'name',
    name: 'Name',
    fieldName: 'name',
    minWidth: 200,
  },
];

const editIcon: IIconProps = { iconName: 'EditMirrored' };

const deleteIcon: IIconProps = { iconName: 'Delete' };

const action = mergeStyles({
  height: 'auto',
  fontSize: '16px',
});

const toListItems = (items: SimplAdminListItem[]): IDetailsListProps['items'] =>
  items.map(({ id, name }) => ({
    key: id,
    edit: '',
    name,
    id,
  }));

const createOnRenderItemColumn = (onEdit: Handler, onDelete: Handler) => (
  item: Record<string, string>,
  _: unknown,
  column?: IColumn
): ReactNode => {
  const fieldName = column?.fieldName;
  const value = !fieldName || !item[fieldName] ? '-' : item[fieldName];

  switch (fieldName) {
    case 'edit':
      return (
        <IconButton
          iconProps={editIcon}
          className={action}
          onClick={() => onEdit(item.id)}
          ariaLabel="Edit element"
          data-testid={`edit-element-${item.id}`}
          disabled={true}
        />
      );
    case 'delete':
      return (
        <IconButton
          iconProps={deleteIcon}
          className={action}
          onClick={() => onDelete(item.id)}
          ariaLabel="Delete element"
          data-testid={`delete-element-${item.id}`}
        />
      );
    default:
      return <Text variant="medium">{value}</Text>;
  }
};

export const SimpleAdminList: FC<Props> = ({ items, onEdit, onDelete }) => {
  const onRenderItemColumn = createOnRenderItemColumn(onEdit, onDelete);

  return (
    <DetailsList
      items={toListItems(items)}
      columns={columns}
      layoutMode={DetailsListLayoutMode.justified}
      selectionMode={SelectionMode.none}
      onRenderItemColumn={onRenderItemColumn}
    />
  );
};