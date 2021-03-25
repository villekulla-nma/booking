import type {
  FastifyRequest,
  FastifyReply,
  RouteShorthandOptions,
} from 'fastify';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createEvent, getOverlappingEvents } from '../controllers/event';
import type { Db } from '../db';

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
  preHandler: [preVerifySessionHandler],
};

const createCheckOverlappingEvents = (db: Db) => async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply
) => {
  const { start, end } = request.body;
  const { resourceId } = request.params;
  const overlappingEvents = await getOverlappingEvents(
    db,
    resourceId,
    start,
    end
  );

  if (overlappingEvents.length > 0) {
    reply.status(400).send({ status: 'overlapping' });
  }
};

export const assignPutEventHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  const checkOverlappingEvents = createCheckOverlappingEvents(db);

  if (Array.isArray(opts.preHandler)) {
    opts.preHandler.push(checkOverlappingEvents);
  } else {
    opts.preHandler = checkOverlappingEvents;
  }

  server.put(route, opts, async (request: Request<Params>, reply) => {
    let status = 200;
    const response = { status: 'ok' };
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
      response.status = status === 400 ? 'invalid' : 'error';
    }

    reply.status(status).send(response);
  });
};
