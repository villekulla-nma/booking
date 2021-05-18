import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';
import type { EventResult } from '@booking/types';

import type { Db } from '../db';
import type { ResourceResult, UserResult } from './types';
import { getNow, getToday } from '../utils/date';
import type { EventInstance } from '../models';

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

const toEventResult = (events: EventInstance[]): EventResult[] =>
  events.map(({ id, start, end, description, allDay, createdAt }) => ({
    id,
    start,
    end,
    description,
    allDay,
    createdAt,
  }));

export const getScopedEvents = async (
  { Event }: Db,
  resourceId: string,
  start: string,
  end: string
): Promise<EventResult[]> => {
  const events = await Event.findAll({
    where: {
      resourceId: { [Op.eq]: resourceId },
      start: { [Op.gte]: start },
      end: { [Op.lte]: end },
    },
  });

  return toEventResult(events);
};

export const getOverlappingEvents = async (
  { Event }: Db,
  resourceId: string,
  startString: string,
  endString: string
): Promise<EventResult[]> => {
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

  return toEventResult(overlappingEvents);
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

// TODO: sort by start date (desc)
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
  const createdAt = getNow().toISOString();

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
  const result = await Event.destroy({
    where: {
      id: { [Op.eq]: eventId },
      userId: { [Op.eq]: userId },
    },
  });

  return result === 1;
};
