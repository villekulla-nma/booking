import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { getPort } from './helpers/get-port';

describe('Server [POST] /api/password-reset', () => {
  let port: string;
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
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should always respond with status "ok"', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/password-reset`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: 'nobody@example.com' }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });

  it('should add a password reset token to the user', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/password-reset`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: 'person.one@example.com' }),
      }
    );
    const data = await response.json();
    const user = await db.User.findByPk('TD0sIeaoz');

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(user.passwordReset).toMatch(/^[0-9a-f]+$/);
  });
});
