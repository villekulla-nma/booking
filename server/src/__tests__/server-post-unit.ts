import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { updateUnit } from '../controllers/unit';

jest.mock('../controllers/unit');

describe('Server [POST] /api/units', () => {
  const unit = {
    id: 'Uj5SAS740',
    name: 'Super Unit #1',
  };
  const newName = 'Awesome Unit #1';
  const updatedUnit = { name: newName, id: unit.id };

  let port: number;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  beforeAll(async () => {
    log = console.log;
    db = await initDb();
    server = await initServer(db, '0');
    port = (server.server.address() as AddressInfo).port;

    console.log = () => undefined;

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
    await db.Unit.create(unit);
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
      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedUnit),
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
      (updateUnit as jest.Mock).mockResolvedValueOnce(false);

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedUnit),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should respond with 400/invalid on Sequel Validation Error', async () => {
      (updateUnit as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('nope'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedUnit),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on general error', async () => {
      (updateUnit as jest.Mock).mockRejectedValueOnce(new Error('nope'));

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedUnit),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should respond with 200/ok on success', async () => {
      (updateUnit as jest.Mock).mockImplementationOnce(
        jest.requireActual('../controllers/unit').updateUnit
      );

      const response = await fetch(`http://localhost:${port}/api/units`, {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedUnit),
      });
      const data = await response.json();
      const result = await db.Unit.findByPk(unit.id);

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(result.name).toBe(newName);
    });
  });
});
