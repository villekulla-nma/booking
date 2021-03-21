import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getScopedEvents } from '../controllers/event';

interface Querystring {
  start: string;
  end: string;
}

interface Params {
  resourceId: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        start: { type: 'string' },
        end: { type: 'string' },
      },
    },
    params: {
      type: 'object',
      properties: {
        resourceId: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetAllEventsHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request<Params>, reply) => {
    const { start, end } = request.query as Querystring;
    const { resourceId } = request.params;

    const events = await getScopedEvents(db, resourceId, start, end);

    reply.send(events);
  });
};
