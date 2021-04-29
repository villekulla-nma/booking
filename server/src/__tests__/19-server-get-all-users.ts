import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';

describe('Server [GET] /api/users', () => {
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9190');

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      groupId: 'YLBqxvCCm',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'admin',
      groupId: 'MTpZEtFhN',
    });

    cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  describe('Unauthorized user', () => {
    beforeAll(async () => {
      cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
    });

    afterAll(() => {
      cookieValue = undefined;
    });

    it('should respond with 401/invalid', async () => {
      const response = await fetch('http://localhost:9190/api/users', {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('invalid');
    });
  });

  describe('Authorized user', () => {
    beforeAll(async () => {
      cookieValue = await signJwt({ id: 'Ul2Zrv1BX' }, process.env.JWT_SECRET);
    });

    afterAll(() => {
      cookieValue = undefined;
    });

    it('should respond with 200 & a list', async () => {
      const response = await fetch('http://localhost:9190/api/users', {
        headers: {
          cookie: `login=${cookieValue}`,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.payload.length).toBe(2);
      expect(data.payload[0].fullName).toBe('Person1 One');
      expect(data.payload[1].fullName).toBe('Person2 Two');
    });
  });
});