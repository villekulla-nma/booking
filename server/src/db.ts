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
  });
  const dataPromise = getScaffoldingData(
    path.resolve(__dirname, '..', 'scaffolding')
  );
  const Resource = createResourceInstance(sequelize);
  const Group = createGroupInstance(sequelize);
  const User = createUserInstance(sequelize);
  const Event = createEventInstance(sequelize);
  const [data] = await Promise.all([dataPromise, sequelize.sync()]);

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
    console.log('Connection has been established successfully.');
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
