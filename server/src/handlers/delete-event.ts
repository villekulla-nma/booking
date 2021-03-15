import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';

interface Params {
  eventId: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
      },
    },
  },
};

export const assignDeleteEventHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.delete(route, opts, async (request, reply) => {
    let status = 201;
    const { eventId } = request.params as Params;

    try {
      await db.removeEvent(eventId);
    } catch {
      status = 500;
    }

    reply.status(status).send();
  });
};
