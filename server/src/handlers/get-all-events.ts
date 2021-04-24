import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getScopedEvents } from '../controllers/event';
import { rawBaseEventSchema } from '../utils/schema';

interface Querystring {
  start: string;
  end: string;
}

interface Params {
  resourceId: string;
}

const reDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

const querystringSchema = S.object()
  .prop('start', S.string().pattern(reDate).required())
  .prop('end', S.string().pattern(reDate).required())
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

const responseSchema200 = S.array().items(eventSchema).valueOf();

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

    reply.send(events);
  });
};
