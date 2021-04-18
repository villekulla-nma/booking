import jwt from 'jsonwebtoken';

import { env } from './env';

const DateNowInSeconds = (): number => {
  const now = Date.now();

  return Math.round(now / 1000);
};

export const signJwt = async (
  payload: Record<string, unknown>,
  expiresIn = '2 days'
): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, env('JWT_SECRET'), { expiresIn }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });

export const verifyJwt = async (token: string): Promise<unknown> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, env('JWT_SECRET'), (err, data) => {
      if (err) {
        reject(err);
      } else {
        const { exp } = data as Record<string, unknown>;

        if (typeof exp === 'number' && exp > DateNowInSeconds()) {
          resolve(data);
        } else {
          reject(new Error('token is expired'));
        }
      }
    });
  });
