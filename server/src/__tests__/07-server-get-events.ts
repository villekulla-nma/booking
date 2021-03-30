import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import type { ResourceInstance } from '../models/resource';
import type { EventInstance } from '../models/event';

const getDate = (timestamp = Date.now()): string =>
  new Date(timestamp).toISOString().split('T').shift();

describe('Server [GET] /api/resources/:resourceId/events', () => {
  const today = getDate();
  const tomorrow = getDate(Date.now() + 24 * 3600 * 1000);
  const dayAfterTomorrow = getDate(Date.now() + 48 * 3600 * 1000);
  const threeDaysAhead = getDate(Date.now() + 72 * 3600 * 1000);
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9070');

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      groupId: 'YLBqxvCCm',
    });
    await db.Resource.bulkCreate<ResourceInstance>([
      {
        id: 'Uj5SAS740',
        name: 'Resource #1',
      },
      {
        id: 'gWH5T7Kdz',
        name: 'Resource #2',
      },
    ]);
    await db.Event.bulkCreate<EventInstance>([
      {
        id: 'Zbfn4lu5t',
        start: `${today}T08:30:00.000Z`,
        end: `${today}T12:00:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'A nice event',
        userId: 'TD0sIeaoz',
      },
      {
        id: 'HBv7p7CVC',
        start: `${tomorrow}T08:30:00.000Z`,
        end: `${tomorrow}T12:00:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'A nice event',
        userId: 'TD0sIeaoz',
      },
      {
        id: 'W4zOBWmrf',
        start: `${tomorrow}T08:30:00.000Z`,
        end: `${tomorrow}T10:00:00.000Z`,
        allDay: false,
        resourceId: 'gWH5T7Kdz',
        description: 'Another nice event',
        userId: 'TD0sIeaoz',
      },
      {
        id: 'ctigHisJr',
        start: `${dayAfterTomorrow}T07:00:00.000Z`,
        end: `${dayAfterTomorrow}T11:30:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'Thingies',
        userId: 'TD0sIeaoz',
      },
    ]);

    cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should respond with 200 on success', async () => {
    const start = `${tomorrow}T00:00:00`;
    const end = `${dayAfterTomorrow}T00:00:00`;
    const search = new URLSearchParams({ start, end }).toString();
    const response = await fetch(
      `http://localhost:9070/api/resources/Uj5SAS740/events?${search}`,
      {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const events = await response.json();

    expect(response.status).toBe(200);
    expect(events.length).toBe(1);
    expect(events[0].description).toBe('A nice event');
  });

  it('should respond with an empty list', async () => {
    const start = `${threeDaysAhead}T00:00:00`;
    const end = `${threeDaysAhead}T23:59:59`;
    const search = new URLSearchParams({ start, end }).toString();
    const response = await fetch(
      `http://localhost:9070/api/resources/Uj5SAS740/events?${search}`,
      {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const events = await response.json();

    expect(events).toEqual([]);
  });
});
