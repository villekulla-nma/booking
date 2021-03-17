import type { AssignHandlerFunction } from './type';

export const getResourcesHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.get(route, async (_, reply) => {
    const resources = await db.getAllResources();

    reply.send(resources);
  });
};
