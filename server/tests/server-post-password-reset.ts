import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';

import type { Db } from '../src/db';
import { initDb } from '../src/db';
import { initServer } from '../src/server';
import { sendMail } from '../src/utils/send-mail';

jest.mock('../src/utils/send-mail');

describe('Server [POST] /api/password-reset', () => {
  let port: number;
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
    const data = (await response.json()) as Record<string, unknown>;

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
    const data = (await response.json()) as Record<string, unknown>;
    const user = await db.User.findByPk('TD0sIeaoz');

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(user.passwordReset).toMatch(/^[0-9a-f]+$/);
  });

  it('should send an email to the user', async () => {
    await fetch(`http://localhost:${port}/api/password-reset`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'person.one@example.com' }),
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Passwort-Reset',
        text: expect.stringMatching(/^Moin Person1,/),
        to: 'person.one@example.com',
      })
    );
  });
});
