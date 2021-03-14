import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import proxy from 'fastify-http-proxy';

import type { AppModel } from './model';
import type { AssignHandlerFunction } from './handlers/type';
import { assignPutEventHandler } from './handlers/put-event';
import { assignGetAllEventsHandler } from './handlers/get-all-events';
import { assignGetEventByIdHandler } from './handlers/get-event-by-id';
import { assignDeleteEventHandler } from './handlers/delete-event';

const routes: [string, AssignHandlerFunction][] = [
  ['/api/resources/:resourceId/events', assignPutEventHandler],
  ['/api/resources/:resourceId/events', assignGetAllEventsHandler],
  ['/api/events/:eventId', assignGetEventByIdHandler],
  ['/api/events/:eventId', assignDeleteEventHandler],
];

const initProxy = (server: FastifyInstance): void => {
  if (typeof process.env.CLIENT_URL === 'string') {
    server.register(proxy, {
      upstream: process.env.CLIENT_URL,
      http2: false,
    });
  }
};

export const initServer = async (model: AppModel): Promise<void> => {
  const server = Fastify({ logger: true });

  routes.forEach(([route, handler]) => handler(route, server, model));

  server.get(
    '/api/resources',
    async (_, reply): Promise<void> => {
      const resources = await model.getAllResources();

      reply.send(resources);
    }
  );
  server.get(
    '/api/groups',
    async (_, reply): Promise<void> => {
      const groups = await model.getAllGroups();

      reply.send(groups);
    }
  );
  server.get(
    '/api/users',
    async (_, reply): Promise<void> => {
      const users = await model.getAllUsers();

      reply.send(users);
    }
  );

  await initProxy(server);
  await server.listen(process.env.PORT || '3000');
};
