import type { FastifyInstance } from 'fastify';
import type { UserRole } from '@booking/types';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { updateUser } from '../controllers/user';
import { getPort } from './helpers/get-port';

jest.mock('../controllers/user');

describe('Server [POST] /api/user', () => {
  const userOne = {
    id: 'TD0sIeaoz',
    email: 'person.one@example.com',
    firstName: 'Person1',
    lastName: 'One',
    role: 'user' as UserRole,
    groupId: 'YLBqxvCCm',
  };

  let port: string;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  beforeAll(async () => {
    port = getPort(__filename);
    log = console.log;
    db = await initDb();
    server = await initServer(db, port);

    console.log = () => undefined;

    await db.User.create(userOne);
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'admin',
      groupId: 'MTpZEtFhN',
    });
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();

    console.log = log;
  });

  describe('Unauthorized user', () => {
    beforeEach(async () => {
      cookieValue = await signJwt(
        { id: 'TD0sIeaoz', role: 'user' },
        process.env.JWT_SECRET
      );
    });

    afterEach(() => {
      cookieValue = undefined;
    });

    it('should respond with 401/invalid', async () => {
      const response = await fetch(`http://localhost:${port}/api/user`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ...userOne, firstName: 'Persona Uno' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('invalid');
    });
  });

  describe('Authorized user', () => {
    beforeEach(async () => {
      cookieValue = await signJwt(
        { id: 'Ul2Zrv1BX', role: 'admin' },
        process.env.JWT_SECRET
      );
    });

    afterEach(() => {
      cookieValue = undefined;
    });

    it('should respond with 400/error on failure', async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce(false);

      const response = await fetch(`http://localhost:${port}/api/user`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ...userOne, firstName: 'Persona Uno' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should respond with 400/invalid on Sequel Validation Error', async () => {
      (updateUser as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('nope'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch(`http://localhost:${port}/api/user`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ...userOne, firstName: 'Persona Uno' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on general error', async () => {
      (updateUser as jest.Mock).mockRejectedValueOnce(new Error('nope'));

      const response = await fetch(`http://localhost:${port}/api/user`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ...userOne, firstName: 'Persona Uno' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should respond with 200/ok on success', async () => {
      (updateUser as jest.Mock).mockImplementationOnce(
        jest.requireActual('../controllers/user').updateUser
      );

      const response = await fetch(`http://localhost:${port}/api/user`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ...userOne, firstName: 'Persona Uno' }),
      });
      const data = await response.json();
      const result = await db.User.findByPk(userOne.id);

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(result.firstName).toBe('Persona Uno');
    });
  });
});
