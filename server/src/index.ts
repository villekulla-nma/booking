import dotenv from 'dotenv';

import { initModel } from './model';
import { initServer } from './server';

const { error } = dotenv.config();

if (error) {
  throw error;
}

(async () => {
  try {
    const model = await initModel();

    process.once('exit', () => model?.terminate());

    await initServer(model);
  } catch (err) {
    throw err;
  }
})();
