import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

import { env } from './utils/env';
import type { Db } from './db';
import type { AssignHandlerFunction } from './handlers/type';
import { assignGetResourcesHandler } from './handlers/get-resurces';
import { assignPutEventHandler } from './handlers/put-event';
import { assignGetAllEventsHandler } from './handlers/get-all-events';
import { assignGetEventByIdHandler } from './handlers/get-event-by-id';
import { assignDeleteEventHandler } from './handlers/delete-event';
import { assignPostLoginHandler } from './handlers/post-login';
import { assignGetUserHandler } from './handlers/get-user';
import { assignPutUserHandler } from './handlers/put-user';
import { assignGetUserEventsHandler } from './handlers/get-user-events';
import { assignPostLogoutHandler } from './handlers/post-logout';
import { assignPostPasswordResetHandler } from './handlers/post-password-reset';
import { assignPostPasswordUpdateHandler } from './handlers/post-password-update';
import { assignGetHealthHandler } from './handlers/get-health';
import { assignPutUnitHandler } from './handlers/put-unit';
import { assignPutResourceHandler } from './handlers/put-resource';
import { assignDeleteUserHandler } from './handlers/delete-user';
import { assignDeleteResourceHandler } from './handlers/delete-resource';
import { assignDeleteUnitHandler } from './handlers/delete-unit';
import { assignGetUnitsHandler } from './handlers/get-units';
import { assignGetAllUsersHandler } from './handlers/get-all-users';
import { assignPostUnitHandler } from './handlers/post-unit';
import { assignPostResourceHandler } from './handlers/post-resource';
import { assignPostUserHandler } from './handlers/post-user';

const routes: [string, AssignHandlerFunction][] = [
  ['/api/_health', assignGetHealthHandler],
  ['/api/login', assignPostLoginHandler],
  ['/api/logout', assignPostLogoutHandler],
  ['/api/password-reset', assignPostPasswordResetHandler],
  ['/api/password-reset/:token', assignPostPasswordUpdateHandler],
  ['/api/user', assignGetUserHandler],
  ['/api/user', assignPutUserHandler],
  ['/api/user', assignPostUserHandler],
  ['/api/user', assignDeleteUserHandler],
  ['/api/users', assignGetAllUsersHandler],
  ['/api/user/events', assignGetUserEventsHandler],
  ['/api/resources', assignGetResourcesHandler],
  ['/api/resources', assignPutResourceHandler],
  ['/api/resources', assignPostResourceHandler],
  ['/api/resources', assignDeleteResourceHandler],
  ['/api/resources/:resourceId/events', assignPutEventHandler],
  ['/api/resources/:resourceId/events', assignGetAllEventsHandler],
  ['/api/events/:eventId', assignGetEventByIdHandler],
  ['/api/events/:eventId', assignDeleteEventHandler],
  ['/api/units', assignGetUnitsHandler],
  ['/api/units', assignPutUnitHandler],
  ['/api/units', assignPostUnitHandler],
  ['/api/units', assignDeleteUnitHandler],
];

export const initServer = async (
  db: Db,
  port?: string
): Promise<FastifyInstance> => {
  const level = process.env.NODE_ENV === 'test' ? 'silent' : 'trace';
  const server = Fastify({ logger: { level } });

  routes.forEach(([route, handler]) => handler(route, server, db));

  await server.listen({ port: Number(port || env('PORT') || '3000') });

  return server;
};
