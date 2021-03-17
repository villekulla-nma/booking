import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import { preVerifySessionHandler } from './pre-verify-session';

const opts: RouteShorthandOptions = {
  preHandler: preVerifySessionHandler,
};

export const getResourcesHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, opts, async (_, reply) => {
    const resources = await db.getAllResources();

    reply.send(resources);
  });
};
