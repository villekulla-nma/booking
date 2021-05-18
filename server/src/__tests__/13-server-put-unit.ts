import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { createUnit, getAllUnits } from '../controllers/unit';
import { getPort } from './helpers/get-port';

jest.mock('../controllers/unit');

describe('Server [PUT] /api/units', () => {
  let port: string;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  const newUnit = {
    id: 'Uj5SAS740',
    name: 'Super Unit #1',
  };

  beforeAll(async () => {
    port = getPort(__filename);
    db = await initDb();
    server = await initServer(db, port);
    log = console.log;

    console.log = () => undefined;

    (getAllUnits as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/unit').getAllUnits
    );

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      unitId: 'YLBqxvCCm',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'admin',
      unitId: 'MTpZEtFhN',
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
      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUnit),
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
      (createUnit as jest.Mock).mockRejectedValue(
        Object.assign(new Error('wrong'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUnit),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on failure', async () => {
      (createUnit as jest.Mock).mockRejectedValue(new Error('nope'));

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUnit),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should successfully ceate a user', async () => {
      (createUnit as jest.Mock).mockImplementation(
        jest.requireActual('../controllers/unit').createUnit
      );

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'PUT',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(newUnit),
      });
      const data = await response.json();
      const unit = (await getAllUnits(db)).find(
        ({ name }) => name === newUnit.name
      );

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(unit).toBeDefined();
    });
  });
});
