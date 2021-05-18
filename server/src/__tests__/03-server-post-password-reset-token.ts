import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import { Op } from 'sequelize';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { updateUser, getUserByKey } from '../controllers/user';
import { getPort } from './helpers/get-port';

jest.mock('../controllers/user');

describe('Server [POST] /api/password-reset/:token', () => {
  let port: string;
  const token = 'c2c4a54d1f64ed8eca662783b013bf6e';
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    port = getPort(__filename);
    db = await initDb();
    server = await initServer(db, port);
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  beforeEach(async () => {
    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      unitId: 'YLBqxvCCm',
      passwordReset: token,
    });
  });

  afterEach(async () => {
    await db.User.destroy({
      where: {
        id: { [Op.eq]: 'TD0sIeaoz' },
      },
    });
  });

  it('should respond with 400/invalid if confirm does not match', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/password-reset/${token}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          password: '12345678',
          password_confirm: '90123456',
        }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('invalid');
  });

  it('should respond with 400/error if token does not exist', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/password-reset/non-exisiting-token`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          password: '12345678',
          password_confirm: '12345678',
        }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should respond with 400/error if the update fails', async () => {
    (getUserByKey as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').getUserByKey
    );
    (updateUser as jest.Mock).mockResolvedValue(false);

    const response = await fetch(
      `http://localhost:${port}/api/password-reset/non-exisiting-token`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          password: '12345678',
          password_confirm: '12345678',
        }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should respond with 200/ok if update succeeds', async () => {
    (getUserByKey as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').getUserByKey
    );
    (updateUser as jest.Mock).mockImplementation(
      jest.requireActual('../controllers/user').updateUser
    );

    const response = await fetch(
      `http://localhost:${port}/api/password-reset/${token}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          password: 'test1234',
          password_confirm: 'test1234',
        }),
      }
    );
    const data = await response.json();
    const user = await db.User.findByPk('TD0sIeaoz');

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(user.password).toBe(
      '$2a$10$Fu9T8J7sDe8yQYTInoCS/eBfJgIGkkl91QTCsV0mNcUiXmUBor9rK'
    );
    expect(user.passwordReset).toBeNull();
  });
});
