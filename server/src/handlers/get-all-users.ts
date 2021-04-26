import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { preVerifySessionHandler } from './pre-verify-session';
import { getAllUsers } from '../controllers/user';
import { STATUS } from '../constants';
import { createPreVerifyAuthorizationHandler } from './create-pre-verify-authorization';
import { rawUserSchema } from '../utils/schema';

const responseSchema200 = S.object()
  .prop('payload', S.array().items(rawUserSchema).required())
  .prop('status', S.const(STATUS.OK).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: responseSchema200,
    },
  },
  preHandler: [preVerifySessionHandler],
};

export const assignGetAllUsersHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  const preVerifyAuthorizationHandler = createPreVerifyAuthorizationHandler(db);

  if (Array.isArray(opts.preHandler)) {
    opts.preHandler.push(preVerifyAuthorizationHandler);
  } else {
    opts.preHandler = preVerifyAuthorizationHandler;
  }

  server.get(route, opts, async (_, reply) => {
    const users = await getAllUsers(db);
    const response = { status: STATUS.OK, payload: users };

    reply.send(response);
  });
};
