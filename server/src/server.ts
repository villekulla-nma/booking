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
import { assignGetUserHandler } from './handlers/get-user';
import { assignGetUserEventsHandler } from './handlers/get-user-events';
import { assignPostLogoutHandler } from './handlers/post-logout';
import { assignPostPasswordResetHandler } from './handlers/post-password-reset';
import { assignPostPasswordUpdateHandler } from './handlers/post-password-update';
import { assignGetHealthHandler } from './handlers/get-health';
import { CSP_DIRECTIVES } from './constants';

const routes: [string, AssignHandlerFunction][] = [
  ['/api/_health', assignGetHealthHandler],
  ['/api/login', assignPostLoginHandler],
  ['/api/logout', assignPostLogoutHandler],
  ['/api/password-reset', assignPostPasswordResetHandler],
  ['/api/password-reset/:token', assignPostPasswordUpdateHandler],
  ['/api/user', assignGetUserHandler],
  ['/api/user/events', assignGetUserEventsHandler],
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
      logLevel: 'error',
      replyOptions: {
        rewriteHeaders: (headers) => ({
          ...headers,
          'Content-Security-Policy-Report-Only': CSP_DIRECTIVES.join('; '),
        }),
      },
    });
  }
};

export const initServer = async (
  db: Db,
  port?: string
): Promise<FastifyInstance> => {
  const level = process.env.NODE_ENV === 'test' ? 'silent' : 'trace';
  const server = Fastify({ logger: { level } });

  routes.forEach(([route, handler]) => handler(route, server, db));

  await initProxy(server);
  await server.listen(port || env('PORT') || '3000');

  return server;
};
