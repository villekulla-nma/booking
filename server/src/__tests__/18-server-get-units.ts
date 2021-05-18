import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import type { UnitInstance } from '../models/unit';
import { getPort } from './helpers/get-port';

describe('Server [GET] /api/units', () => {
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
    await db.Unit.bulkCreate<UnitInstance>([
      {
        id: 'Uj5SAS740',
        name: 'Unit #1',
      },
      {
        id: 'gWH5T7Kdz',
        name: 'Unit #2',
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
    const response = await fetch(`http://localhost:${port}/api/units`, {
      headers: {
        cookie: `login=${cookieValue}`,
      },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.payload.length).toBe(2);
    expect(data.payload[0].name).toBe('Unit #1');
    expect(data.payload[1].name).toBe('Unit #2');
  });
});
