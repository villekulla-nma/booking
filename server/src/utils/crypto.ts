import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { env } from './env';

export const verifyPassword = async (
  plain: string,
  hash: string
): Promise<boolean> => {
  const result = await bcrypt.compare(plain, hash);

  return result;
};

export const hashPassword = async (password: string): Promise<string> => {
  const hash = await bcrypt.hash(password, env('SALT'));

  return hash;
};

export const randomBytes = (length: number): string =>
  crypto.randomBytes(length).toString('hex').slice(0, length).toString();
