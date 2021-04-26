import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';

describe('Server [GET] /api/user', () => {
  let cookieValue: string;
  let invalidCookieValue: string;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9040');
    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      groupId: 'YLBqxvCCm',
    });
    cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
    invalidCookieValue = await signJwt({ id: 'TD0sIeaoz' }, 'wrong-secret');
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should respond with 401/error on missing cookie', async () => {
    const response = await fetch('http://localhost:9040/api/user');
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe('error');
  });

  it.each([
    [1, 'some-complete-gibberish'],
    [2, invalidCookieValue],
  ])(
    'should respond with 400/invalid on invalid cookies & delete the cookie [%i]',
    async (_, cookie) => {
      const response = await fetch('http://localhost:9040/api/user', {
        headers: {
          cookie: `login=${cookie}`,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
      expect(response.headers.get('set-cookie')).toBe(
        'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true'
      );
    }
  );

  it('should respond with 200/ok on valid cookies', async () => {
    const response = await fetch('http://localhost:9040/api/user', {
      headers: {
        cookie: `login=${cookieValue}`,
      },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.payload).toEqual({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      fullName: 'Person1 One',
      role: 'user',
    });
  });
});
