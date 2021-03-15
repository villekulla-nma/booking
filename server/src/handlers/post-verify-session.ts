import type { RouteShorthandOptions } from 'fastify';
import jwt from 'jsonwebtoken';
import type { User } from '@villekulla-reservations/types';

import type { AssignHandlerFunction } from './type';

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
            },
          },
          status: { type: 'string' },
        },
        required: ['user', 'status'],
      },
      '4xx': {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
        required: ['status'],
      },
    },
  },
};

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
  db
) => {
  server.post(route, opts, async (request, reply) => {
    let status = 200;
    const response: { status: string; user?: User } = { status: 'ok' };
    const [, token] =
      request.headers?.cookie?.match(/login=([^;]+)(;|$)/) || [];

    do {
      if (!token) {
        response.status = 'error';
        status = 401;
        break;
      }
      const { id: userId } = await verifyToken(token);

      if (!userId) {
        response.status = 'invalid';
        status = 400;
        break;
      }

      const { id, firstName, lastName, email } = await db.getUserById(userId);
      response.user = { id, firstName, lastName, email };
    } while (false);

    reply.status(status).send(response);
  });
};
