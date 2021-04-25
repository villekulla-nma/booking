import type { GroupAttributes as GroupResult } from '@booking/types';

import type { Db } from '../db';

export const getAllGroups = async ({ Group }: Db): Promise<GroupResult[]> => {
  const groups = await Group.findAll();

  return groups.map(({ id, name }) => ({ id, name }));
};

export const getGroupById = async (
  { Group }: Db,
  groupId: string
): Promise<GroupResult | null> => {
  const group = await Group.findByPk(groupId);

  return (
    group && {
      id: groupId,
      name: group.name,
    }
  );
};
