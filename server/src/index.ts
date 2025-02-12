import { initDb } from './db';
import { initServer } from './server';

(async () => {
  const db = await initDb();

  process.once('exit', () => db?.terminate());

  await initServer(db);
})();
