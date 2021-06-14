import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { preVerifySessionHandler } from './pre-verify-session';
import { getAllUsers } from '../controllers/user';
import { STATUS } from '../constants';
import { preVerifyAuthorizationHandler } from './pre-verify-authorization';
import { rawUserSchema } from '../utils/schema';

const userSchema = S.object()
  .additionalProperties(false)
  .prop('passwordReset', S.anyOf([S.string(), S.null()]).required())
  .extend(rawUserSchema);

const responseSchema200 = S.object()
  .prop('payload', S.array().items(userSchema).required())
  .prop('status', S.const(STATUS.OK).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: responseSchema200,
    },
  },
  preHandler: [preVerifySessionHandler, preVerifyAuthorizationHandler],
};

export const assignGetAllUsersHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (_, reply) => {
    const users = await getAllUsers(db);
    const response = { status: STATUS.OK, payload: users };

    reply.send(response);
  });
};
