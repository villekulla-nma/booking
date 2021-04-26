import type { GroupAttributes as GroupResult } from '@booking/types';
import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';

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

export const createGroup = async (
  { Group }: Db,
  name: string
): Promise<string> => {
  const id = shortid();

  await Group.create({ id, name });

  return id;
};

export const removeGroup = async (
  { Group }: Db,
  groupId: string
): Promise<boolean> => {
  const result = await Group.destroy({
    where: {
      id: { [Op.eq]: groupId },
    },
  });

  return result === 1;
};
