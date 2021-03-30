import type { AssignHandlerFunction } from './type';

export const assignGetHealthHandler: AssignHandlerFunction = (
  route,
  server
) => {
  server.get(route, async (_, reply) =>
    reply.header('Access-Control-Allow-Origin', '*').type('text').send('ok')
  );
};
