import jwt from 'jsonwebtoken';

export const signJwt = async (
  payload: { id: string; role: string },
  secret: string
): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, secret, { expiresIn: '2 minutes' }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );
