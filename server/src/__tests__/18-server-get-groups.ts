import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import type { GroupInstance } from '../models/group';
import { getPort } from './helpers/get-port';

describe('Server [GET] /api/groups', () => {
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
      groupId: 'YLBqxvCCm',
    });
    await db.Group.bulkCreate<GroupInstance>([
      {
        id: 'Uj5SAS740',
        name: 'Group #1',
      },
      {
        id: 'gWH5T7Kdz',
        name: 'Group #2',
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

  it('should respond with 200 & a list', async () => {
    const response = await fetch(`http://localhost:${port}/api/groups`, {
      headers: {
        cookie: `login=${cookieValue}`,
      },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.payload.length).toBe(2);
    expect(data.payload[0].name).toBe('Group #1');
    expect(data.payload[1].name).toBe('Group #2');
  });
});
