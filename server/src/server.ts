import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import proxy from 'fastify-http-proxy';

import type { Db } from './db';
import type { AssignHandlerFunction } from './handlers/type';
import { getResourcesHandler } from './handlers/get-resurces';
import { assignPutEventHandler } from './handlers/put-event';
import { assignGetAllEventsHandler } from './handlers/get-all-events';
import { assignGetEventByIdHandler } from './handlers/get-event-by-id';
import { assignDeleteEventHandler } from './handlers/delete-event';
import { assignPostLoginHandler } from './handlers/post-login';
import { assignPostVerifySessionHandler } from './handlers/post-verify-session';
import { assignPostLogoutHandler } from './handlers/post-logout';

const routes: [string, AssignHandlerFunction][] = [
  ['/api/login', assignPostLoginHandler],
  ['/api/logout', assignPostLogoutHandler],
  ['/api/verify-session', assignPostVerifySessionHandler],
  ['/api/resources', getResourcesHandler],
  ['/api/resources/:resourceId/events', assignPutEventHandler],
  ['/api/resources/:resourceId/events', assignGetAllEventsHandler],
  ['/api/events/:eventId', assignGetEventByIdHandler],
  ['/api/events/:eventId', assignDeleteEventHandler],
];

const initProxy = (server: FastifyInstance): void => {
  if (typeof process.env.CLIENT_URL === 'string') {
    server.register(proxy, {
      upstream: process.env.CLIENT_URL,
      base: '/app',
      http2: false,
    });
  }
};

export const initServer = async (db: Db): Promise<void> => {
  const server = Fastify({ logger: { level: 'trace' } });

  routes.forEach(([route, handler]) => handler(route, server, db));

  await initProxy(server);
  await server.listen(process.env.PORT || '3000');
};
