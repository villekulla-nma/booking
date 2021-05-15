import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { removeResource } from '../controllers/resource';
import { getPort } from './helpers/get-port';

jest.mock('../controllers/resource');

describe('Server [DELETE] /api/resources', () => {
  let port: string;
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['error'];

  beforeAll(async () => {
    port = getPort(__filename);
    db = await initDb();
    server = await initServer(db, port);
    log = console.error;

    console.error = () => undefined;

    await db.Resource.create({
      id: 'Uj5SAS740',
      name: 'Resource #1',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'admin',
      groupId: 'MTpZEtFhN',
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
    (removeResource as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/resource').removeResource
    );

    const response = await fetch(`http://localhost:${port}/api/resources`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'Uj5SAS740' }),
    });
    const resource = await db.Resource.findByPk('Uj5SAS740');

    expect(response.status).toBe(200);
    expect(resource).toBeNull();
  });

  it('should respond with 400 on failure', async () => {
    (removeResource as jest.Mock).mockResolvedValue(false);

    const response = await fetch(`http://localhost:${port}/api/resources`, {
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
    (removeResource as jest.Mock).mockRejectedValue(new Error('nope'));

    const response = await fetch(`http://localhost:${port}/api/resources`, {
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
