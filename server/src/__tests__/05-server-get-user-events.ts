import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import type { ResourceInstance } from '../models/resource';
import type { EventInstance } from '../models/event';
import { getDates } from './helpers/get-dates';
import { getPort } from './helpers/get-port';

describe('Server [GET] /api/user/events', () => {
  let port: string;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    port = getPort(__filename);
    db = await initDb();
    server = await initServer(db, port);
    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      unitId: 'YLBqxvCCm',
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
    cookieValue = await signJwt(
      { id: 'TD0sIeaoz', role: 'user' },
      process.env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  describe('empty response', () => {
    it('should respond with 200/ok', async () => {
      const response = await fetch(`http://localhost:${port}/api/user/events`, {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.payload).toEqual([]);
    });
  });

  describe('exisiting events', () => {
    const { today, tomorrow } = getDates();

    beforeAll(async () => {
      await db.Event.bulkCreate<EventInstance>([
        {
          id: 'Ja2mFvsGM',
          start: '2021-03-26T11:30:00.000Z',
          end: '2021-03-26T15:00:00.000Z',
          allDay: false,
          resourceId: 'Uj5SAS740',
          description: 'An event in the past',
          userId: 'TD0sIeaoz',
          createdAt: '2021-03-25T10:15:56.000Z',
        },
        {
          id: 'SHYVTIGoM',
          start: `${today}T00:00:00.000Z`,
          end: `${today}T23:59:59.000Z`,
          allDay: true,
          resourceId: 'gWH5T7Kdz',
          description: 'Party all day!!1',
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
          id: 'VKZ27GlOF',
          start: `${tomorrow}T13:00:00.000Z`,
          end: `${tomorrow}T13:30:00.000Z`,
          allDay: false,
          resourceId: 'Uj5SAS740',
          description: 'Event by another user',
          userId: '4XNdIWWOy',
          createdAt: '2021-03-25T10:15:56.000Z',
        },
      ]);
    });

    it('should respond with the events', async () => {
      const response = await fetch(`http://localhost:${port}/api/user/events`, {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.payload).toEqual([
        {
          id: 'SHYVTIGoM',
          start: `${today}T00:00:00.000Z`,
          end: `${today}T23:59:59.000Z`,
          allDay: true,
          resource: 'Resource #2',
          description: 'Party all day!!1',
          createdAt: '2021-03-25T10:15:56.000Z',
        },
        {
          id: 'HBv7p7CVC',
          start: `${tomorrow}T08:30:00.000Z`,
          end: `${tomorrow}T12:00:00.000Z`,
          allDay: false,
          resource: 'Resource #1',
          description: 'A nice event',
          createdAt: '2021-03-25T10:15:56.000Z',
        },
      ]);
    });

    it('should respect the limit-param', async () => {
      const response = await fetch(
        `http://localhost:${port}/api/user/events?limit=1`,
        {
          headers: {
            cookie: `login=${cookieValue}`,
          },
        }
      );
      const data = await response.json();

      expect(data.payload).toEqual([
        {
          id: 'SHYVTIGoM',
          start: `${today}T00:00:00.000Z`,
          end: `${today}T23:59:59.000Z`,
          allDay: true,
          resource: 'Resource #2',
          description: 'Party all day!!1',
          createdAt: '2021-03-25T10:15:56.000Z',
        },
      ]);
    });
  });
});
