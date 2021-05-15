import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { removeUser } from '../controllers/user';
import { getPort } from './helpers/get-port';

jest.mock('../controllers/user');

describe('Server [DELETE] /api/user', () => {
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
    (removeUser as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').removeUser
    );

    const response = await fetch(`http://localhost:${port}/api/user`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'TD0sIeaoz' }),
    });
    const user = await db.User.findByPk('TD0sIeaoz');

    expect(response.status).toBe(200);
    expect(user).toBeNull();
  });

  it('should respond with 400 on failure', async () => {
    (removeUser as jest.Mock).mockResolvedValue(false);

    const response = await fetch(`http://localhost:${port}/api/user`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'TD0sIeaoz' }),
    });

    expect(response.status).toBe(400);
  });

  it('should respond with 500 on error', async () => {
    (removeUser as jest.Mock).mockRejectedValue(new Error('nope'));

    const response = await fetch(`http://localhost:${port}/api/user`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'TD0sIeaoz' }),
    });

    expect(response.status).toBe(500);
  });

  it('should not allow to delete own account', async () => {
    (removeUser as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').removeUser
    );

    const response = await fetch(`http://localhost:${port}/api/user`, {
      method: 'DELETE',
      headers: {
        cookie: `login=${cookieValue}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ id: 'Ul2Zrv1BX' }),
    });
    const { message } = await response.json();

    expect(response.status).toBe(400);
    expect(message).toBe('Cannot delete your own account.');
  });
});
