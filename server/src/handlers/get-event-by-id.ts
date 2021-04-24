import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getEventById } from '../controllers/event';
import {
  rawBaseEventSchema,
  rawUserSchema,
  rawResourceSchema,
} from '../utils/schema';

interface Params {
  eventId: string;
}

const paramsSchema = S.object()
  .prop('eventId', S.string().required())
  .prop('userId', S.string())
  .valueOf();

const responseSchema200 = S.object()
  .definition('user', rawUserSchema)
  .definition('resource', rawResourceSchema)
  .additionalProperties(false)
  .prop('id', S.string().required())
  .prop('createdAt', S.string().format(S.FORMATS.DATE_TIME).required())
  .prop('resource', S.ref('#resource'))
  .prop('user', S.ref('#user'))
  .extend(rawBaseEventSchema);

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    response: { 200: responseSchema200 },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetEventByIdHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request<Params>, reply) => {
    const { eventId } = request.params;

    const event = await getEventById(db, eventId);

    reply.send(event);
  });
};
