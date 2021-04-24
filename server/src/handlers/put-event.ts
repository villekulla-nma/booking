import type {
  FastifyRequest,
  FastifyReply,
  RouteShorthandOptions,
} from 'fastify';
import S from 'fluent-json-schema';

import { STATUS } from '../constants';
import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createEvent, getOverlappingEvents } from '../controllers/event';
import type { Db } from '../db';
import { defaultResponseSchema, rawBaseEventSchema } from '../utils/schema';

interface Params {
  resourceId: string;
}

interface Body {
  start: string;
  end: string;
  description: string;
  allDay: boolean;
}

const bodySchema = S.object()
  .additionalProperties(false)
  .extend(rawBaseEventSchema)
  .valueOf();

const paramsSchema = S.object()
  .prop('resourceId', S.string().required())
  .prop('userId', S.string())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    params: paramsSchema,
    response: defaultResponseSchema,
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
    reply.status(400).send({ status: STATUS.OVERLAPPING });
  }
};

// TODO: check that start is before end
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
    let code = 200;
    const response = { status: STATUS.OK };
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
      code = error.name === 'SequelizeValidationError' ? 400 : 500;
      response.status = code === 400 ? STATUS.INVALID : STATUS.ERROR;
    }

    reply.status(code).send(response);
  });
};
