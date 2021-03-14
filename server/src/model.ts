import path from 'path';
import { Sequelize, Op } from 'sequelize';
import type { Options } from 'sequelize';
import { generate as shortid } from 'shortid';

import {
  createResourceInstance,
  createGroupInstance,
  createUserInstance,
  createEventInstance,
  EventInstance,
} from './models';
import type { GroupInstance, ResourceInstance, UserInstance } from './models';
import { getScaffoldingData, writeScaffoldingData } from './utils/scaffolding';

export interface AppModel {
  getAllResources: () => Promise<ResourceInstance[]>;
  getAllGroups: () => Promise<GroupInstance[]>;
  getAllUsers: () => Promise<UserInstance[]>;
  getAllEventsByResource: (
    resourceId: string,
    start: string,
    end: string
  ) => Promise<EventInstance[]>;
  getEventById: (eventId: string) => Promise<EventInstance>;

  createEvent: (
    start: string,
    end: string,
    description: string,
    allDay: boolean,
    resourceId: string,
    userId: string
  ) => Promise<EventInstance>;

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
  const Event = createEventInstance(db);
  const [data] = await Promise.all([dataPromise, db.sync()]);

  User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
  Event.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Event.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

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
    getAllEventsByResource: (resourceId: string, start: string, end: string) =>
      Event.findAll({
        where: {
          resourceId: { [Op.eq]: resourceId },
          start: { [Op.gte]: start },
          end: { [Op.lte]: end },
        },
      }),
    getEventById: (eventId: string) =>
      Event.findByPk(eventId, {
        include: [
          { model: Resource, as: 'resource' },
          { model: User, as: 'user' },
        ],
      }),

    createEvent: (
      start: string,
      end: string,
      description: string,
      allDay: boolean,
      resourceId: string,
      userId: string
    ) =>
      Event.create({
        id: shortid(),
        all_day: allDay,
        start,
        end,
        description,
        resourceId,
        userId,
      }),

    terminate: () => db.close(),
  };
};
