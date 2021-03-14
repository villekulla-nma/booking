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

export const assignGetEventByIdHandler: AssignHandlerFunction = (
  route,
  server,
  model
) => {
  server.get(route, opts, async (request, reply) => {
    const { eventId } = request.params as Params;

    const event = await model.getEventById(eventId);

    reply.send(event);
  });
};
