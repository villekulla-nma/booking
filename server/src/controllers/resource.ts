import type { Db } from '../db';
import type { ResourceResult } from './types';

export const getAllResources = async ({
  Resource,
}: Db): Promise<ResourceResult[]> => {
  const resources = await Resource.findAll();

  return resources.map(({ id, name }) => ({ id, name }));
};
