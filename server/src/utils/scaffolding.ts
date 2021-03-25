import { promises as fs } from 'fs';
import type { ModelCtor, Sequelize } from 'sequelize';

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

export const getScaffoldingData = async (): Promise<
  Record<string, unknown>
> => {
  const data = await readFile(env('SCAFFOLDING_DATA'));

  return data;
};

export const writeScaffoldingData = async (
  sequelize: Sequelize,
  data: Record<string, unknown>,
  instances: ModelInstances
): Promise<void> => {
  await sequelize.transaction(async (t) => {
    return await Promise.all(
      Object.keys(data).map(
        async (key: string): Promise<unknown> => {
          switch (key) {
            case 'Resource': {
              return scaffoldResources(instances.Resource, data.Resource, t);
            }
            case 'Group': {
              return scaffoldGroups(instances.Group, data.Group, t);
            }
            case 'User': {
              return scaffoldUsers(instances.User, data.User, t);
            }
            default:
              return Promise.resolve();
          }
        }
      )
    );
  });
};
