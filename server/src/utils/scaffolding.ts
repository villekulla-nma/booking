import path from 'path';
import { promises as fs } from 'fs';
import type { ModelCtor } from 'sequelize';

import { env } from './env';
import { scaffoldResources, scaffoldGroups, scaffoldUsers } from '../models';
import type { GroupInstance, ResourceInstance, UserInstance } from '../models';

interface ModelInstances {
  Group: ModelCtor<GroupInstance>;
  Resource: ModelCtor<ResourceInstance>;
  User: ModelCtor<UserInstance>;
}

const readFile = async (filename: string): Promise<Record<string, unknown>> => {
  try {
    return await fs.readFile(filename, 'utf8').then(JSON.parse);
  } catch {
    console.log(
      'Ignoring "%s" because it either does not exist or is invalid JSON.',
      filename
    );
    return {};
  }
};

export const getScaffoldingData = async (
  dir: string
): Promise<Record<string, unknown>> => {
  const data = await readFile(path.join(dir, 'data.json'));

  if (env('NODE_ENV') === 'development') {
    const devData = await readFile(path.join(dir, 'dev-data.json'));
    Object.assign(data, devData);
  }

  return data;
};

export const writeScaffoldingData = async (
  data: Record<string, unknown>,
  instances: ModelInstances
): Promise<void> => {
  await Promise.all(
    Object.keys(data).map(
      async (key: string): Promise<unknown> => {
        switch (key) {
          case 'Resource': {
            return scaffoldResources(instances.Resource, data.Resource);
          }
          case 'Group': {
            return scaffoldGroups(instances.Group, data.Group);
          }
          case 'User': {
            return scaffoldUsers(instances.User, data.User);
          }
          default:
            return Promise.resolve();
        }
      }
    )
  );
};
