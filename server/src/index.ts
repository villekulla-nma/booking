import dotenv from 'dotenv';

import { initDb } from './db';
import { initServer } from './server';

const { error } = dotenv.config();

if (error) {
  throw error;
}

(async () => {
  try {
    const db = await initDb();

    process.once('exit', () => db?.terminate());

    await initServer(db);
  } catch (err) {
    throw err;
  }
})();
