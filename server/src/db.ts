import { Sequelize } from 'sequelize';
import type { ModelCtor } from 'sequelize';

import { env } from './utils/env';
import {
  createResourceInstance,
  createGroupInstance,
  createUserInstance,
  createEventInstance,
} from './models';
import type {
  GroupInstance,
  ResourceInstance,
  UserInstance,
  EventInstance,
} from './models';
import { getScaffoldingData, writeScaffoldingData } from './utils/scaffolding';
import { getAdminListFromEnv } from './utils/get-admin-list-from-env';

export interface Db {
  Event: ModelCtor<EventInstance>;
  Group: ModelCtor<GroupInstance>;
  Resource: ModelCtor<ResourceInstance>;
  User: ModelCtor<UserInstance>;

  terminate: () => Promise<void>;
}

export const initDb = async (): Promise<Db> => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env('SQLITE3_PATH'),
    logging: process.env.NODE_ENV === 'test' ? false : console.log,
  });
  const dataPromise = getScaffoldingData();
  const Resource = createResourceInstance(sequelize);
  const Group = createGroupInstance(sequelize);
  const User = createUserInstance(sequelize);
  const Event = createEventInstance(sequelize);
  const [data] = await Promise.all([dataPromise, sequelize.sync()]);

  data.User = [
    ...((data.User as unknown[] | undefined) || []),
    ...getAdminListFromEnv(),
  ];

  User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
  Event.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Event.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

  try {
    await writeScaffoldingData(sequelize, data, { Group, Resource, User });
  } catch (error) {
    console.error(error);
    throw error;
  }

  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }

  const db: Db = {
    Event,
    Group,
    Resource,
    User,

    terminate: () => sequelize.close(),
  };

  return db;
};
