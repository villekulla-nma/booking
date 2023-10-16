import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';
import type { EventResult } from '@booking/types';

import type { Db } from '../db';
import type { ResourceResult, UserResult } from './types';
import { getFauxUTCDate, getToday } from '../utils/date';

type SingleEventResult = EventResult & {
  user: UserResult;
  resource: ResourceResult;
};

type UserEvent = EventResult & {
  resource: string;
};

const pick = <Input, Key extends keyof Input>(
  input: Input,
  ...properties: Key[]
): Pick<Input, Key> =>
  properties.reduce((acc: Pick<Input, Key>, key: Key) => {
    acc[key] = input[key];
    return acc;
  }, {} as Pick<Input, Key>);

export const getScopedEvents = async (
  { Event, User }: Db,
  resourceId: string,
  start: string,
  end: string
): Promise<(EventResult & { color: string; unit: string })[]> => {
  const events = await Event.findAll({
    where: {
      resourceId: { [Op.eq]: resourceId },
      [Op.or]: [
        {
          start: {
            [Op.between]: [start, end],
          },
        },
        {
          end: {
            [Op.between]: [start, end],
          },
        },
        {
          start: { [Op.lte]: start },
          end: { [Op.gte]: end },
        },
      ],
    },
    include: [
      {
        model: User,
        as: 'user',
        include: [User.associations.unit],
      },
    ],
    order: [['start', 'ASC']],
  });

  return events.map(
    ({ id, start, end, description, allDay, createdAt, user }) => ({
      color: user.unit.color,
      unit: user.unit.name,
      id,
      start,
      end,
      description,
      allDay,
      createdAt,
    })
  );
};

// TODO: rename to `issOverlapping` & adjust
//       implementation accordingly
export const getOverlappingEvents = async (
  { Event }: Db,
  resourceId: string,
  startString: string,
  endString: string
): Promise<string[]> => {
  // Allow events to have overlapping start- & endpoints,
  // because this is how Fullcalendar deals with
  // subsequent events.
  const alteredStart = new Date(startString);
  const alteredEnd = new Date(endString);
  alteredStart.setTime(alteredStart.getTime() + 1000);
  alteredEnd.setTime(alteredEnd.getTime() - 1000);
  const start = alteredStart.toISOString();
  const end = alteredEnd.toISOString();

  const overlappingEvents = await Event.findAll({
    where: {
      [Op.and]: [
        {
          resourceId: { [Op.eq]: resourceId },
        },
        {
          [Op.or]: [
            {
              start: {
                [Op.between]: [start, end],
              },
            },
            {
              end: {
                [Op.between]: [start, end],
              },
            },
            {
              [Op.and]: [
                { start: { [Op.lte]: start } },
                { end: { [Op.gte]: end } },
              ],
            },
          ],
        },
      ],
    },
  });

  return overlappingEvents.map(({ id }) => id);
};

export const getEventById = async (
  { Event, Resource, User }: Db,
  id: string
): Promise<SingleEventResult | null> => {
  const event = await Event.findByPk(id, {
    include: [
      { model: Resource, as: 'resource' },
      { model: User, as: 'user' },
    ],
  });

  if (!event) {
    return null;
  }

  const { start, end, description, allDay, user, resource, createdAt } = event;

  return {
    user: pick(
      user,
      'id',
      'role',
      'firstName',
      'lastName',
      'fullName',
      'email',
      'unitId'
    ),
    resource: pick(resource, 'id', 'name'),
    id,
    start,
    end,
    description,
    allDay,
    createdAt,
  };
};

export const getUpcomingEventsByUserId = async (
  { Event, Resource }: Db,
  userId: string,
  limit?: number
): Promise<UserEvent[]> => {
  const today = getToday();
  const upcomingEvents = await Event.findAll({
    include: [{ model: Resource, as: 'resource' }],
    where: {
      userId: { [Op.eq]: userId },
      start: { [Op.gte]: today },
    },
    order: [['start', 'ASC']],
    limit,
  });

  return upcomingEvents.map(
    ({ id, start, end, description, allDay, resource, createdAt }) => ({
      resource: resource.name,
      id,
      start,
      end,
      description,
      allDay,
      createdAt,
    })
  );
};

export const createEvent = async (
  { Event }: Db,
  start: string,
  end: string,
  description: string,
  allDay: boolean,
  resourceId: string,
  userId: string
): Promise<string> => {
  const id = shortid();
  const createdAt = getFauxUTCDate().toISOString();

  await Event.create({
    id,
    allDay,
    start,
    end,
    description,
    resourceId,
    userId,
    createdAt,
  });

  return id;
};

export const removeEvent = async (
  { Event }: Db,
  eventId: string,
  userId: string
): Promise<boolean> => {
  const now = getFauxUTCDate().toISOString();
  const result = await Event.destroy({
    where: {
      id: { [Op.eq]: eventId },
      userId: { [Op.eq]: userId },
      start: { [Op.gt]: now },
    },
  });

  return result === 1;
};
