import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { getPort } from './helpers/get-port';

describe('Server [GET] /api/_health', () => {
  let port: string;
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

  it('should respond with 200 on success', async () => {
    const response = await fetch(`http://localhost:${port}/api/_health`);
    const status = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(status).toBe('ok');
  });
});
