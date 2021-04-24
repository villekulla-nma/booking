import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { preVerifySessionHandler } from './pre-verify-session';
import { getAllResources } from '../controllers/resource';
import { rawResourceSchema } from '../utils/schema';

const paramsSchema = S.object().prop('userId', S.string()).valueOf();

const reponseSchema200 = S.array().items(rawResourceSchema).valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    response: {
      200: reponseSchema200,
    },
  },
  preHandler: preVerifySessionHandler,
};

export const getResourcesHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (_, reply) => {
    const resources = await getAllResources(db);

    reply.send(resources);
  });
};
