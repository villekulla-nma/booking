import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { removeGroup } from '../controllers/group';

jest.mock('../controllers/group');

describe('Server [DELETE] /api/groups', () => {
  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['error'];

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '9170');
    log = console.error;

    console.error = () => undefined;

    await db.Group.create({
      id: 'Uj5SAS740',
      name: 'Super Group #1',
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
    (removeGroup as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/group').removeGroup
    );

    const response = await fetch('http://localhost:9170/api/groups', {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'Uj5SAS740' }),
    });
    const group = await db.Group.findByPk('Uj5SAS740');

    expect(response.status).toBe(200);
    expect(group).toBeNull();
  });

  it('should respond with 400 on failure', async () => {
    (removeGroup as jest.Mock).mockResolvedValue(false);

    const response = await fetch('http://localhost:9170/api/groups', {
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
    (removeGroup as jest.Mock).mockRejectedValue(new Error('nope'));

    const response = await fetch('http://localhost:9170/api/groups', {
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
