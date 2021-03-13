import path from 'path';
import { Sequelize } from 'sequelize';
import type { Options } from 'sequelize';

import {
  createResourceInstance,
  createGroupInstance,
  createUserInstance,
} from './models';
import type { GroupInstance, ResourceInstance, UserInstance } from './models';
import { getScaffoldingData, writeScaffoldingData } from './utils/scaffolding';

export interface AppModel {
  getAllResources: () => Promise<ResourceInstance[]>;
  getAllGroups: () => Promise<GroupInstance[]>;
  getAllUsers: () => Promise<UserInstance[]>;
  terminate: () => Promise<void>;
}

const options: Options = {
  define: {},
};

export const initModel = async (): Promise<AppModel> => {
  const db = new Sequelize('sqlite::memory:', options);
  const dataPromise = getScaffoldingData(
    path.resolve(__dirname, '..', 'scaffolding')
  );
  const Resource = createResourceInstance(db);
  const Group = createGroupInstance(db);
  const User = createUserInstance(db);
  const [data] = await Promise.all([dataPromise, db.sync()]);

  User.belongsTo(Group, { foreignKey: 'group' });

  try {
    await writeScaffoldingData(data, { Group, Resource, User });
  } catch (error) {
    console.error(error);
    throw error;
  }

  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }

  return {
    getAllResources: () => Resource.findAll(),
    getAllGroups: () => Group.findAll(),
    getAllUsers: () => User.findAll(),
    terminate: () => db.close(),
  };
};
