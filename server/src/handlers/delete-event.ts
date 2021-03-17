import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';

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

export const assignDeleteEventHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.delete(route, opts, async (request: Request<Params>, reply) => {
    let status: number;
    const { eventId, userId } = request.params;

    try {
      const result = await db.removeEvent(eventId, userId);
      status = result === 1 ? 200 : 400;
    } catch {
      status = 500;
    }

    reply.status(status).send();
  });
};
