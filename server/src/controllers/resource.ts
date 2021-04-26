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

  await Resource.create({ name });

  return id;
};
