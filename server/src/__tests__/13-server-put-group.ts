import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { createGroup, getAllGroups } from '../controllers/group';

jest.mock('../controllers/group');

describe('Server [PUT] /api/groups', () => {
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  const newGroup = {
    id: 'Uj5SAS740',
    name: 'Super Group #1',
  };

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9130');
    log = console.log;

    console.log = () => undefined;

    (getAllGroups as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/group').getAllGroups
    );

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
      cookieValue = await signJwt(
        { id: 'TD0sIeaoz', role: 'user' },
        process.env.JWT_SECRET
      );
    });

    afterAll(() => {
      cookieValue = undefined;
    });

    it('should respond with 401/invalid', async () => {
      const response = await fetch('http://localhost:9130/api/groups', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('invalid');
    });
  });

  describe('Authorized user', () => {
    beforeAll(async () => {
      cookieValue = await signJwt(
        { id: 'Ul2Zrv1BX', role: 'admin' },
        process.env.JWT_SECRET
      );
    });

    afterAll(() => {
      cookieValue = undefined;
    });

    it('should respond with 400/invalid on Sequelize Validation Error', async () => {
      (createGroup as jest.Mock).mockRejectedValue(
        Object.assign(new Error('wrong'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch('http://localhost:9130/api/groups', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on failure', async () => {
      (createGroup as jest.Mock).mockRejectedValue(new Error('nope'));

      const response = await fetch('http://localhost:9130/api/groups', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should successfully ceate a user', async () => {
      (createGroup as jest.Mock).mockImplementation(
        jest.requireActual('../controllers/group').createGroup
      );

      const response = await fetch('http://localhost:9130/api/groups', {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      });
      const data = await response.json();
      const group = (await getAllGroups(db)).find(
        ({ name }) => name === newGroup.name
      );

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(group).toBeDefined();
    });
  });
});
