import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';

describe('Server [GET] /api/events/:eventId', () => {
  const [today] = new Date().toISOString().split('T');
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
    await db.Event.create({
      id: 'Zbfn4lu5t',
      start: `${today}T08:30:00.000Z`,
      end: `${today}T12:00:00.000Z`,
      allDay: false,
      resourceId: 'Uj5SAS740',
      description: 'A nice event',
      userId: 'TD0sIeaoz',
      createdAt: '2021-03-25T10:15:56.000Z',
    });

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
    const response = await fetch(
      `http://localhost:${port}/api/events/Zbfn4lu5t`,
      {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.payload.description).toBe('A nice event');
  });
});
