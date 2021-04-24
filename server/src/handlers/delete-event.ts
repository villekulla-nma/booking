import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { removeEvent } from '../controllers/event';

interface Params {
  eventId: string;
}

const paramsSchema = S.object()
  .prop('eventId', S.string().required())
  .prop('userId', S.string())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
  },
  preHandler: preVerifySessionHandler,
};

export const assignDeleteEventHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.delete(route, opts, async (request: Request<Params>, reply) => {
    let status: number;
    const { eventId, userId } = request.params;

    try {
      const succeeded = await removeEvent(db, eventId, userId);
      status = succeeded ? 200 : 400;
    } catch {
      status = 500;
    }

    reply.status(status).send();
  });
};
