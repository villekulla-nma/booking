import dotenv from 'dotenv';

import { initServer } from './server';

const { error } = dotenv.config();

if (error) {
  throw error;
}

initServer().catch(console.error);
