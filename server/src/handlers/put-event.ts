import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createEvent } from '../controllers/event';

interface Params {
  resourceId: string;
}

interface Body {
  start: string;
  end: string;
  description: string;
  allDay: boolean;
  userId: string;
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
        userId: { type: 'string' },
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

export const assignPutEventHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.put(route, opts, async (request: Request<Params>, reply) => {
    let status = 201;
    const { resourceId, userId } = request.params;
    const { start, end, description, allDay } = request.body as Body;

    try {
      await createEvent(
        db,
        start,
        end,
        description,
        allDay,
        resourceId,
        userId
      );
    } catch (error) {
      console.log(error);
      status = error.name === 'SequelizeValidationError' ? 400 : 500;
    }

    reply.status(status).send();
  });
};
