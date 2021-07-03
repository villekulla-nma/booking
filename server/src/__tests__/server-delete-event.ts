import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { getDates } from './helpers/get-dates';
import { removeEvent } from '../controllers/event';
import type { EventInstance } from '../models/event';

jest.mock('../controllers/event');

describe('Server [DELETE] /api/events/:eventId', () => {
  const { yesterday, tomorrow } = getDates();
  let port: number;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '0');
    port = (server.server.address() as AddressInfo).port;

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      unitId: 'YLBqxvCCm',
    });
    await db.Resource.create({
      id: 'Uj5SAS740',
      name: 'Resource #1',
    });
    await db.Event.bulkCreate<EventInstance>([
      {
        id: 'Zbfn4lu5t',
        start: `${tomorrow}T08:30:00.000Z`,
        end: `${tomorrow}T12:00:00.000Z`,
        allDay: false,
        resourceId: 'Uj5SAS740',
        description: 'A nice event',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
      },
      {
        id: 'ctigHisJr',
        start: `${yesterday}T07:00:00.000Z`,
        end: `${yesterday}T13:00:00.000Z`,
        allDay: false,
        resourceId: 'gWH5T7Kdz',
        description: 'Thingies',
        userId: 'TD0sIeaoz',
        createdAt: '2021-03-25T10:15:56.000Z',
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

  it('should respond with 200 on success', async () => {
    (removeEvent as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/event').removeEvent
    );

    const response = await fetch(
      `http://localhost:${port}/api/events/Zbfn4lu5t`,
      {
        method: 'DELETE',
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const event = await db.Event.findByPk('Zbfn4lu5t');

    expect(response.status).toBe(200);
    expect(event).toBeNull();
  });

  it.each([
    ['event in the past', 'ctigHisJr'],
    ['non-existing event', 'GjcSASl40'],
  ])('should respond with 400 on %s', async (_, eventId) => {
    (removeEvent as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/event').removeEvent
    );

    const response = await fetch(
      `http://localhost:${port}/api/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });

  it('should respond with 500 on error', async () => {
    (removeEvent as jest.Mock).mockRejectedValue(new Error('nope'));

    const response = await fetch(
      `http://localhost:${port}/api/events/Zbfn4lu5t`,
      {
        method: 'DELETE',
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );

    expect(response.status).toBe(500);
  });
});
