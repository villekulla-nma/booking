import type { RouteShorthandOptions } from 'fastify';
import type { User } from '@villekulla-reservations/types';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getUserById } from '../controllers/user';

const opts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
    },
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
  preHandler: preVerifySessionHandler,
};

export const assignGetUserHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request, reply) => {
    const { id, firstName, lastName, email } = await getUserById(
      db,
      request.params.userId
    );
    const user: User = { id, firstName, lastName, email };
    const response = { status: 'ok', user };

    reply.status(200).send(response);
  });
};
