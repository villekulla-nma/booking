import jwt from 'jsonwebtoken';

export const signJwt = async (
  payload: Record<string, unknown>,
  expiresIn = '2 days'
): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });

export const verifyJwt = async (token: string): Promise<unknown> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
