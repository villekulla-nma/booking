import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getEventById } from '../controllers/event';

interface Params {
  eventId: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetEventByIdHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request<Params>, reply) => {
    const { eventId } = request.params;

    const event = await getEventById(db, eventId);

    reply.send(event);
  });
};
