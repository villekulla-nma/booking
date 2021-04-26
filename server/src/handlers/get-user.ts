import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { getUserById } from '../controllers/user';
import { responseSchema4xx, rawUserSchema } from '../utils/schema';
import { STATUS } from '../constants';

const paramsSchema = S.object().prop('userId', S.string()).valueOf();

const responseSchema200 = S.object()
  .definition('user', rawUserSchema)
  .prop('payload', S.ref('#user').required())
  .prop('status', S.const(STATUS.OK).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    response: {
      200: responseSchema200,
      '4xx': responseSchema4xx,
    },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetUserHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (request: Request, reply) => {
    const user = await getUserById(db, request.params.userId);
    const response = { status: STATUS.OK, payload: user };

    reply.status(200).send(response);
  });
};
