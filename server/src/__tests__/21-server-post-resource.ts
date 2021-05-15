import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { updateResource } from '../controllers/resource';
import { getPort } from './helpers/get-port';

jest.mock('../controllers/resource');

describe('Server [POST] /api/resources', () => {
  const resource = {
    id: 'Uj5SAS740',
    name: 'Resource #1',
  };
  const newName = 'Resource #2';
  const updatedResource = { name: newName, id: resource.id };

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
    await db.Resource.create(resource);
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
      const response = await fetch(`http://localhost:${port}/api/resources`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
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
      (updateResource as jest.Mock).mockResolvedValueOnce(false);

      const response = await fetch(`http://localhost:${port}/api/resources`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should respond with 400/invalid on Sequel Validation Error', async () => {
      (updateResource as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('nope'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch(`http://localhost:${port}/api/resources`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on general error', async () => {
      (updateResource as jest.Mock).mockRejectedValueOnce(new Error('nope'));

      const response = await fetch(`http://localhost:${port}/api/resources`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should respond with 200/ok on success', async () => {
      (updateResource as jest.Mock).mockImplementationOnce(
        jest.requireActual('../controllers/resource').updateResource
      );

      const response = await fetch(`http://localhost:${port}/api/resources`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedResource),
      });
      const data = await response.json();
      const result = await db.Resource.findByPk(resource.id);

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(result.name).toBe(newName);
    });
  });
});
