import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { removeUnit } from '../controllers/unit';

jest.mock('../controllers/unit');

describe('Server [DELETE] /api/units', () => {
  let port: number;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['error'];

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '0');
    port = (server.server.address() as AddressInfo).port;
    log = console.error;

    console.error = () => undefined;

    await db.Unit.create({
      id: 'Uj5SAS740',
      name: 'Super Unit #1',
      color: '#ff0000',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'admin',
      unitId: 'MTpZEtFhN',
    });

    cookieValue = await signJwt(
      { id: 'Ul2Zrv1BX', role: 'admin' },
      process.env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();

    console.error = log;
  });

  it('should respond with 200 on success', async () => {
    (removeUnit as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/unit').removeUnit
    );

    const response = await fetch(`http://localhost:${port}/api/units`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'Uj5SAS740' }),
    });
    const unit = await db.Unit.findByPk('Uj5SAS740');

    expect(response.status).toBe(200);
    expect(unit).toBeNull();
  });

  it('should respond with 400 on failure', async () => {
    (removeUnit as jest.Mock).mockResolvedValue(false);

    const response = await fetch(`http://localhost:${port}/api/units`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'Uj5SAS740' }),
    });

    expect(response.status).toBe(400);
  });

  it('should respond with 500 on error', async () => {
    (removeUnit as jest.Mock).mockRejectedValue(new Error('nope'));

    const response = await fetch(`http://localhost:${port}/api/units`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'Uj5SAS740' }),
    });

    expect(response.status).toBe(500);
  });
});
