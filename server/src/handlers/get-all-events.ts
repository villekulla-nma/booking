import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getScopedEvents } from '../controllers/event';
import { rawBaseEventSchema } from '../utils/schema';
import { STATUS } from '../constants';

interface Querystring {
  start: string;
  end: string;
}

interface Params {
  resourceId: string;
}

const querystringSchema = S.object()
  .prop('start', S.string().format(S.FORMATS.DATE_TIME).required())
  .prop('end', S.string().format(S.FORMATS.DATE_TIME).required())
  .valueOf();

const paramsSchema = S.object()
  .prop('resourceId', S.string().required())
  .prop('userId', S.string())
  .valueOf();

const eventSchema = S.object()
  .additionalProperties(false)
  .prop('id', S.string().required())
  .prop('createdAt', S.string().format(S.FORMATS.DATE_TIME).required())
  .extend(rawBaseEventSchema);

const responseSchema200 = S.object()
  .prop('payload', S.array().items(eventSchema).required())
  .prop('status', S.const(STATUS.OK).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    querystring: querystringSchema,
    params: paramsSchema,
    response: { 200: responseSchema200 },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetAllEventsHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request<Params>, reply) => {
    const { start, end } = request.query as Querystring;
    const { resourceId } = request.params;

    const events = await getScopedEvents(db, resourceId, start, end);
    const response = { status: STATUS.OK, payload: events };

    reply.send(response);
  });
};
