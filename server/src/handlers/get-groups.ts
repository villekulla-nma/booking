import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { preVerifySessionHandler } from './pre-verify-session';
import { getAllGroups } from '../controllers/group';
import { STATUS } from '../constants';

const paramsSchema = S.object().prop('userId', S.string()).valueOf();

const groupSchema = S.object()
  .prop('id', S.string().required())
  .prop('name', S.string().required());

const responseSchema200 = S.object()
  .prop('payload', S.array().items(groupSchema).required())
  .prop('status', S.const(STATUS.OK).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    response: {
      200: responseSchema200,
    },
  },
  preHandler: preVerifySessionHandler,
};

export const assignGetGroupsHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (_, reply) => {
    const groups = await getAllGroups(db);
    const response = { status: STATUS.OK, payload: groups };

    reply.send(response);
  });
};
