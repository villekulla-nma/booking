import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getUpcomingEventsByUserId } from '../controllers/event';

interface Querystring {
  limit?: number;
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
    },
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
      },
    },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetUserEventsHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request, reply) => {
    const { userId } = request.params;
    const { limit } = request.query as Querystring;
    const events = await getUpcomingEventsByUserId(db, userId, limit);
    const response = { status: 'ok', events };

    reply.status(200).send(response);
  });
};
