import dotenv from 'dotenv';
import path from 'path';

import { initDb } from './db';
import { initServer } from './server';

const { error } = dotenv.config({
  path: path.join(__dirname, '..', '..', '.env'),
});

if (error) {
  throw error;
}

(async () => {
  const db = await initDb();

  process.once('exit', () => db?.terminate());

  await initServer(db);
})();
