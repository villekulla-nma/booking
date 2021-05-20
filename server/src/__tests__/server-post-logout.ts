import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initServer } from '../server';

describe('Server [POST] /api/logout', () => {
  let port: number;
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await initServer({} as Db, '0');
    port = (server.server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    server.close();
  });

  it('should delete the login cookie', async () => {
    const response = await fetch(`http://localhost:${port}/api/logout`, {
      method: 'POST',
    });
    const cookie = response.headers.get('set-cookie');

    expect(response.status).toBe(200);
    expect(cookie).toBe(
      'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true'
    );
  });
});
