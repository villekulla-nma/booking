import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from '../utils/jwt';

jest.mock('../utils/jwt');

describe('Server [POST] /api/login', () => {
  let port: number;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '0');
    port = (server.server.address() as AddressInfo).port;

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      password: '$2a$10$Fu9T8J7sDe8yQYTInoCS/eTMQn1mxS6IBxlg26I0dq3KKl4CJQY1S', // test
      role: 'user',
      unitId: 'YLBqxvCCm',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'user',
      unitId: 'MTpZEtFhN',
    });
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should respond with 401/invalid to unknown users', async () => {
    const response = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'nobody@example.com', password: '1234' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe('invalid');
  });

  it('should respond with 400/invalid to users without password', async () => {
    const response = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'person.two@example.com',
        password: '1234',
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('unverified');
  });

  it('should respond with 401/invalid on invalid password', async () => {
    const response = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'person.one@example.com',
        password: 'foobar',
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.status).toBe('invalid');
  });

  it('should respond with 500/error if cookie creation fails', async () => {
    (signJwt as jest.Mock).mockRejectedValue(new Error('failed'));

    const response = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'person.one@example.com',
        password: 'test',
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
  });

  it('should respond with 200/ok and the cookie value on success', async () => {
    (signJwt as jest.Mock).mockImplementation(
      jest.requireActual('../utils/jwt').signJwt
    );

    const response = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'person.one@example.com',
        password: 'test',
      }),
    });
    const data = await response.json();
    const [, cookie] = response.headers.get('set-cookie').split('=');
    const [, payload] = cookie.split('.');
    const jwtData = JSON.parse(Buffer.from(payload, 'base64').toString());

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(jwtData.id).toBe('TD0sIeaoz');
    expect(jwtData.role).toBe('user');
  });
});
