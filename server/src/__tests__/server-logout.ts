import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initServer } from '../server';

describe('Server :: /api/logout', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await initServer({} as Db, '9010');
  });

  afterAll(async () => {
    server.close();
  });

  it('should delete the login cookie', async () => {
    const response = await fetch('http://localhost:9010/api/logout', {
      method: 'POST',
    });
    const cookie = response.headers.get('set-cookie');

    expect(response.status).toBe(200);
    expect(cookie).toBe(
      'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true'
    );
  });
});
