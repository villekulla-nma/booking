import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { createUser, getUserByKey, getUserById } from '../controllers/user';

jest.mock('../controllers/user');

describe('Server [PUT] /api/user', () => {
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  const newUser = {
    role: 'user',
    email: 'person.three@example.com',
    firstName: 'Person3',
    lastName: 'Three',
    groupId: 'Uj5SAS740',
  };

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9120');
    log = console.log;

    console.log = () => undefined;

    (getUserById as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').getUserById
    );
    (getUserByKey as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').getUserByKey
    );

    await db.Group.create({
      id: 'Uj5SAS740',
      name: 'Super Group #1',
    });
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
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();

    console.log = log;
  });

  describe('Unauthorized user', () => {
    beforeAll(async () => {
      cookieValue = await signJwt({ id: 'TD0sIeaoz' }, process.env.JWT_SECRET);
    });

    afterAll(() => {
      cookieValue = undefined;
    });

    it('should respond with 401/invalid', async () => {
      const response = await fetch('http://localhost:9120/api/user', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUser),
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

    it('should respond with 400/invalid on non-existing group', async () => {
      (createUser as jest.Mock).mockRejectedValue(
        Object.assign(new Error('wrong'), {
          name: 'SequelizeValidationError',
        })
      );

      const response = await fetch('http://localhost:9120/api/user', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          groupId: newUser.groupId.replace(/./g, 'x'),
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 400/invalid on Sequelize Validation Error', async () => {
      (createUser as jest.Mock).mockRejectedValue(
        Object.assign(new Error('wrong'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch('http://localhost:9120/api/user', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on failure', async () => {
      (createUser as jest.Mock).mockRejectedValue(new Error('nope'));

      const response = await fetch('http://localhost:9120/api/user', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should successfully ceate a user', async () => {
      (createUser as jest.Mock).mockImplementation(
        jest.requireActual('../controllers/user').createUser
      );

      const response = await fetch('http://localhost:9120/api/user', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      const newUserFromDb = await getUserByKey(db, 'email', newUser.email);

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(newUserFromDb.fullName).toBe('Person3 Three');
    });
  });
});
