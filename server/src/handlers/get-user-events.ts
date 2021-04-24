import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getUpcomingEventsByUserId } from '../controllers/event';
import { rawBaseEventSchema, responseSchema4xx } from '../utils/schema';
import { STATUS } from '../constants';

interface Querystring {
  limit?: number;
}

const paramsSchema = S.object().prop('userId', S.string()).valueOf();

const querystringSchema = S.object().prop('limit', S.number()).valueOf();

const rawEventSchema = S.object()
  .additionalProperties(false)
  .prop('id', S.string().required())
  .prop('createdAt', S.string().format(S.FORMATS.DATE_TIME).required())
  .prop('resource', S.string().required())
  .extend(rawBaseEventSchema);

const reponseSchema200 = S.object()
  .prop('status', S.const(STATUS.OK).required())
  .prop('events', S.array().items(rawEventSchema).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    querystring: querystringSchema,
    response: {
      200: reponseSchema200,
      '4xx': responseSchema4xx,
    },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetUserEventsHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request, reply) => {
    const { userId } = request.params;
    const { limit } = request.query as Querystring;
    const events = await getUpcomingEventsByUserId(db, userId, limit);
    const response = { status: STATUS.OK, events };

    reply.status(200).send(response);
  });
};
