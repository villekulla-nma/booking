import type { AssignHandlerFunction } from './type';
import { LOGOUT_COOKIE } from '../constants';

export const assignPostLogoutHandler: AssignHandlerFunction = (
  route,
  server
) => {
  server.post(route, async (_, reply) => {
    reply.header('set-cookie', LOGOUT_COOKIE).status(200).send();
  });
};
