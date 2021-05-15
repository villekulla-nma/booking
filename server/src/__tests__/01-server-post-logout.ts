import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initServer } from '../server';
import { getPort } from './helpers/get-port';

describe('Server [POST] /api/logout', () => {
  let port: string;
  let server: FastifyInstance;

  beforeAll(async () => {
    port = getPort(__filename);
    server = await initServer({} as Db, port);
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
