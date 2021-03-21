import { Op } from 'sequelize';
import { generate as shortid } from 'shortid';

import type { Db } from '../db';
import type { EventResult, ResourceResult, UserResult } from './types';

type SingleEventResult = EventResult & {
  user: UserResult;
  resource: ResourceResult;
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

  return events.map(({ id, start, end, description, allDay }) => ({
    id,
    start,
    end,
    description,
    allDay,
  }));
};

export const getOverlappingEvents = async (
  { Event }: Db,
  resourceId: string,
  start: string,
  end: string
): Promise<EventResult[]> => {
  const overlappingEvents = await Event.findAll({
    where: {
      [Op.and]: [
        {
          resourceId: { [Op.eq]: resourceId },
        },
        {
          [Op.or]: [
            { start: { [Op.between]: [start, end] } },
            { end: { [Op.between]: [start, end] } },
            {
              [Op.and]: [
                { start: { [Op.lt]: start } },
                { end: { [Op.gt]: end } },
              ],
            },
          ],
        },
      ],
    },
  });

  return overlappingEvents.map(({ id, start, end, description, allDay }) => ({
    id,
    start,
    end,
    description,
    allDay,
  }));
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

  const { start, end, description, allDay, user, resource } = event;

  return {
    user: pick(
      user,
      'id',
      'role',
      'firstName',
      'lastName',
      'fullName',
      'email'
    ),
    resource: pick(resource, 'id', 'name'),
    id,
    start,
    end,
    description,
    allDay,
  };
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

  await Event.create({
    id,
    allDay,
    start,
    end,
    description,
    resourceId,
    userId,
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
