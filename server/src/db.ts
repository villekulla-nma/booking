import { DataTypes, Sequelize } from 'sequelize';
import type { ModelCtor } from 'sequelize';

import { env } from './utils/env';
import type {
  UnitInstance,
  ResourceInstance,
  UserInstance,
  EventInstance,
} from './models';
import { getScaffoldingData, writeScaffoldingData } from './utils/scaffolding';
import { getAdminListFromEnv } from './utils/get-admin-list-from-env';
import { createEvent } from '../models/event';
import { createUnit } from '../models/unit';
import { createResource } from '../models/resource';
import { createUser } from '../models/user';

export interface Db {
  Event: ModelCtor<EventInstance>;
  Unit: ModelCtor<UnitInstance>;
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
  const Resource = createResource(sequelize, DataTypes);
  const Unit = createUnit(sequelize, DataTypes);
  const User = createUser(sequelize, DataTypes);
  const Event = createEvent(sequelize, DataTypes);
  const [data] = await Promise.all([dataPromise, sequelize.sync()]);

  data.User = [
    ...((data.User as unknown[] | undefined) || []),
    ...getAdminListFromEnv(),
  ];

  User.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' });
  Event.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Event.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

  try {
    await writeScaffoldingData(sequelize, data, {
      Unit,
      Resource,
      User,
      Event,
    });
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
    Unit,
    Resource,
    User,

    terminate: () => sequelize.close(),
  };

  return db;
};
