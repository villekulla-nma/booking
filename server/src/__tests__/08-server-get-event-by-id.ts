import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';

describe('Server [GET] /api/events/:eventId', () => {
  const [today] = new Date().toISOString().split('T');
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9080');

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      groupId: 'YLBqxvCCm',
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
    });

    cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should respond with 200 on success', async () => {
    const response = await fetch('http://localhost:9080/api/events/Zbfn4lu5t', {
      headers: {
        cookie: `login=${cookieValue}`,
      },
    });
    const event = await response.json();

    expect(response.status).toBe(200);
    expect(event.description).toBe('A nice event');
  });
});
