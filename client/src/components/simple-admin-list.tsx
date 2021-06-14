import type { FC, ReactNode } from 'react';
import { memo } from 'react';
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

export interface SimplAdminListItem extends Record<string, string> {
  id: string;
  name: string;
}

interface Props {
  items: SimplAdminListItem[];
  additionalColumns?: IColumn[];
  onEdit: Handler;
  onDelete: Handler;
}

const columns: IColumn[] = [
  {
    key: 'edit',
    name: 'Bearbeiten',
    fieldName: 'edit',
    minWidth: 90,
    maxWidth: 90,
  },
  {
    key: 'delete',
    name: 'Löschen',
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
    minWidth: 120,
  },
];

const editIcon: IIconProps = { iconName: 'EditMirrored' };

const deleteIcon: IIconProps = { iconName: 'Delete' };

const action = mergeStyles({
  height: 'auto',
  fontSize: '16px',
});

const toListItems = (
  items: SimplAdminListItem[],
  additionalColumns: IColumn[]
): IDetailsListProps['items'] =>
  items.map(({ id, name, ...item }) =>
    Object.assign(
      {
        key: id,
        edit: '',
        name,
        id,
      },
      additionalColumns.reduce(
        (acc: Record<string, string>, { key }: IColumn) => {
          if (typeof item[key] === 'string') {
            acc[key] = item[key];
          }
          return acc;
        },
        {}
      )
    )
  );

const createOnRenderItemColumn =
  (onEdit: Handler, onDelete: Handler) =>
  (item: Record<string, string>, _: unknown, column?: IColumn): ReactNode => {
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

export const SimpleAdminList: FC<Props> = memo(
  ({ items, additionalColumns = [], onEdit, onDelete }) => {
    const onRenderItemColumn = createOnRenderItemColumn(onEdit, onDelete);

    return (
      <DetailsList
        items={toListItems(items, additionalColumns)}
        columns={columns.concat(additionalColumns)}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        onRenderItemColumn={onRenderItemColumn}
      />
    );
  }
);
