import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { preVerifySessionHandler } from './pre-verify-session';
import { getAllResources } from '../controllers/resource';
import { rawResourceSchema } from '../utils/schema';
import { STATUS } from '../constants';

const paramsSchema = S.object().prop('userId', S.string()).valueOf();

const responseSchema200 = S.object()
  .prop('payload', S.array().items(rawResourceSchema).required())
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

export const assignGetResourcesHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (_, reply) => {
    const resources = await getAllResources(db);
    const response = { status: STATUS.OK, payload: resources };

    reply.send(response);
  });
};
