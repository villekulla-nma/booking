import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';

import type { Db } from '../db';
import type { ResourceResult } from './types';

export const getAllResources = async ({
  Resource,
}: Db): Promise<ResourceResult[]> => {
  const resources = await Resource.findAll();

  return resources.map(({ id, name }) => ({ id, name }));
};

export const createResource = async (
  { Resource }: Db,
  name: string
): Promise<string> => {
  const id = shortid();

  await Resource.create({ id, name });

  return id;
};

export const removeResource = async (
  { Resource }: Db,
  resourceId: string
): Promise<boolean> => {
  const result = await Resource.destroy({
    where: {
      id: { [Op.eq]: resourceId },
    },
  });

  return result === 1;
};
