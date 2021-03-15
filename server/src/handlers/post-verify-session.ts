import jwt from 'jsonwebtoken';

import type { AssignHandlerFunction } from './type';

const verifyToken = async (token: string): Promise<{ id?: string }> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(typeof data === 'object' ? data : {});
      }
    });
  });

export const assignPostVerifySessionHandler: AssignHandlerFunction = (
  route,
  server,
  model
) => {
  server.post(route, async (request, reply) => {
    let status = 201;
    const [, token] =
      request.headers?.cookie?.match(/login=([^;]+)(;|$)/) || [];

    do {
      if (!token) {
        status = 401;
        break;
      }
      const { id: userId } = await verifyToken(token);

      if (!userId) {
        status = 400;
        break;
      }

      try {
        await model.getUserById(userId);
      } catch {
        status = 400;
      }
    } while (false);

    reply.status(status).send();
  });
};
