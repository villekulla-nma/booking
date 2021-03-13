import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';

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
      },
    },
  },
};

export const assignGetAllEventsHandler: AssignHandlerFunction = (
  route,
  server,
  model
) => {
  server.get(route, opts, async (request, reply) => {
    const { start, end } = request.query as Querystring;
    const { resourceId } = request.params as Params;

    const events = await model.getAllEventsByResource(resourceId, start, end);

    reply.send(events);
  });
};
