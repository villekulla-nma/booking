import type { FastifyInstance } from 'fastify';
import type { AddressInfo } from 'net';

import type { Db } from '../src/db';
import { initDb } from '../src/db';
import { initServer } from '../src/server';

describe('Server [GET] /api/_health', () => {
  let port: number;
  let server: FastifyInstance;
  let db: Db;

  beforeAll(async () => {
    db = await initDb();
    server = await initServer(db, '0');
    port = (server.server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();
  });

  it('should respond with 200 on success', async () => {
    const response = await fetch(`http://localhost:${port}/api/_health`);
    const status = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(status).toBe('ok');
  });
});
