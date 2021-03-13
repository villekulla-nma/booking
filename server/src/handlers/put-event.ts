import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';

interface Params {
  resourceId: string;
}

interface Body {
  start: string;
  end: string;
  description: string;
  allDay: boolean;
  user: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        start: { type: 'string' },
        end: { type: 'string' },
        description: { type: 'string' },
        allDay: { type: 'boolean' },
        user: { type: 'string' },
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

export const assignPutEventHandler: AssignHandlerFunction = (
  route,
  server,
  model
) => {
  server.put(route, opts, async (request, reply) => {
    let status = 201;
    const { resourceId } = request.params as Params;
    const { start, end, description, allDay, user } = request.body as Body;

    try {
      await model.createEvent(
        start,
        end,
        description,
        allDay,
        resourceId,
        user
      );
    } catch (error) {
      console.log(error);
      status = error.name === 'SequelizeValidationError' ? 400 : 500;
    }

    reply.status(status).send();
  });
};
