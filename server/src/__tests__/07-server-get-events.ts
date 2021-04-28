import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { getDates } from './helpers/get-dates';
import type { ResourceInstance } from '../models/resource';
import type { EventInstance } from '../models/event';

describe('Server [GET] /api/resources/:resourceId/events', () => {
  const { today, tomorrow, dayAfterTomorrow, threeDaysAhead } = getDates();
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
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'a85VfWRQA',
        start: `${today}T00:00:00.000Z`,
        end: `${tomorrow}T00:00:00.000Z`,
        allDay: true,
        resourceId: 'gWH5T7Kdz',
        description: 'All-day event #1',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'HBv7p7CVC',
        start: `${tomorrow}T08:30:00.000Z`,
        end: `${tomorrow}T12:00:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'A nice event',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'W4zOBWmrf',
        start: `${tomorrow}T08:30:00.000Z`,
        end: `${tomorrow}T10:00:00.000Z`,
        allDay: false,
        resourceId: 'gWH5T7Kdz',
        description: 'Another nice event',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'MRaI4jIzw',
        start: `${tomorrow}T00:00:00.000Z`,
        end: `${dayAfterTomorrow}T00:00:00.000Z`,
        allDay: true,
        resourceId: 'gWH5T7Kdz',
        description: 'All-day event #2',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'ctigHisJr',
        start: `${dayAfterTomorrow}T07:00:00.000Z`,
        end: `${dayAfterTomorrow}T11:30:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'Thingies',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
    ]);

    cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should respond with 200 on success for resource Uj5SAS740', async () => {
    const start = `${tomorrow}T00:00:00.000Z`;
    const end = `${dayAfterTomorrow}T00:00:00.000Z`;
    const search = new URLSearchParams({ start, end }).toString();
    const response = await fetch(
      `http://localhost:9070/api/resources/Uj5SAS740/events?${search}`,
      {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.payload.length).toBe(1);
    expect(data.payload[0].description).toBe('A nice event');
  });

  it('should respond with 200 on success for resource gWH5T7Kdz', async () => {
    const start = `${today}T00:00:00.000Z`;
    const end = `${dayAfterTomorrow}T00:00:00.000Z`;
    const search = new URLSearchParams({ start, end }).toString();
    const response = await fetch(
      `http://localhost:9070/api/resources/gWH5T7Kdz/events?${search}`,
      {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.payload.length).toBe(3);
    expect(data.payload[0].description).toBe('All-day event #1');
    expect(data.payload[1].description).toBe('Another nice event');
    expect(data.payload[2].description).toBe('All-day event #2');
  });

  it('should respond with an empty list', async () => {
    const start = `${threeDaysAhead}T00:00:00.000Z`;
    const end = `${threeDaysAhead}T23:59:59.000Z`;
    const search = new URLSearchParams({ start, end }).toString();
    const response = await fetch(
      `http://localhost:9070/api/resources/Uj5SAS740/events?${search}`,
      {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const data = await response.json();

    expect(data.status).toBe('ok');
    expect(data.payload).toEqual([]);
  });
});
