import path from 'path';
import { Sequelize, Op } from 'sequelize';
import type { Options } from 'sequelize';
import { generate as shortid } from 'shortid';

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
import type { UserAttributes } from '@villekulla-reservations/types';

export interface Db {
  getAllResources: () => Promise<ResourceInstance[]>;
  getAllGroups: () => Promise<GroupInstance[]>;
  getAllUsers: () => Promise<UserInstance[]>;
  getAllEventsByResource: (
    resourceId: string,
    start: string,
    end: string
  ) => Promise<EventInstance[]>;
  getEventById: (eventId: string) => Promise<EventInstance>;
  getUserByEmail: (email: string) => Promise<UserInstance | null>;
  getUserById: (userId: string) => Promise<UserInstance>;

  createEvent: (
    start: string,
    end: string,
    description: string,
    allDay: boolean,
    resourceId: string,
    userId: string
  ) => Promise<EventInstance>;

  updateUser: (
    id: string,
    data: Partial<UserAttributes>
  ) => Promise<[number, UserInstance[]]>;

  removeEvent: (eventId: string, userId: string) => Promise<number>;

  terminate: () => Promise<void>;
}

const options: Options = {
  define: {},
};

export const initDb = async (): Promise<Db> => {
  const sequelize = new Sequelize('sqlite::memory:', options);
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
    getAllResources: () => Resource.findAll(),
    getAllGroups: () => Group.findAll(),
    getAllUsers: () => User.findAll(),
    getAllEventsByResource: (resourceId, start, end) =>
      Event.findAll({
        where: {
          resourceId: { [Op.eq]: resourceId },
          start: { [Op.gte]: start },
          end: { [Op.lte]: end },
        },
      }),
    getEventById: (eventId) =>
      Event.findByPk(eventId, {
        include: [
          { model: Resource, as: 'resource' },
          { model: User, as: 'user' },
        ],
      }),
    getUserByEmail: (email) =>
      User.findOne({
        where: {
          email: { [Op.eq]: email },
        },
      }),
    getUserById: (userId) => User.findByPk(userId),

    createEvent: (start, end, description, allDay, resourceId, userId) =>
      Event.create({
        id: shortid(),
        allDay,
        start,
        end,
        description,
        resourceId,
        userId,
      }),

    updateUser: (UserId, data) =>
      User.update(data, {
        where: {
          id: { [Op.eq]: UserId },
        },
      }),

    removeEvent: (eventId, userId) =>
      Event.destroy({
        where: {
          id: { [Op.eq]: eventId },
          userId: { [Op.eq]: userId },
        },
      }),

    terminate: () => sequelize.close(),
  };

  return db;
};
