import type { AssignHandlerFunction } from './type';

export const assignPostLogoutHandler: AssignHandlerFunction = (
  route,
  server
) => {
  server.post(route, async (_, reply) => {
    const cookie =
      'login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true';

    reply.header('set-cookie', cookie).status(201).send();
  });
};
