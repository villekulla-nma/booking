import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import proxy from 'fastify-http-proxy';

import { env } from './utils/env';
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
import { assignPostPasswordResetHandler } from './handlers/post-password-reset';
import { assignPostPasswordUpdateHandler } from './handlers/post-password-update';

const routes: [string, AssignHandlerFunction][] = [
  ['/api/login', assignPostLoginHandler],
  ['/api/logout', assignPostLogoutHandler],
  ['/api/password-reset', assignPostPasswordResetHandler],
  ['/api/password-reset/:token', assignPostPasswordUpdateHandler],
  ['/api/verify-session', assignPostVerifySessionHandler],
  ['/api/resources', getResourcesHandler],
  ['/api/resources/:resourceId/events', assignPutEventHandler],
  ['/api/resources/:resourceId/events', assignGetAllEventsHandler],
  ['/api/events/:eventId', assignGetEventByIdHandler],
  ['/api/events/:eventId', assignDeleteEventHandler],
];

const initProxy = (server: FastifyInstance): void => {
  const clientUrl = env('CLIENT_URL', true);

  if (typeof clientUrl === 'string') {
    server.register(proxy, {
      upstream: clientUrl,
      base: '/app',
      http2: false,
    });
  }
};

export const initServer = async (db: Db): Promise<void> => {
  const server = Fastify({ logger: { level: 'trace' } });

  routes.forEach(([route, handler]) => handler(route, server, db));

  await initProxy(server);
  await server.listen(env('PORT') || '3000');
};
