import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createPreVerifyAuthorizationHandler } from './create-pre-verify-authorization';
import { removeGroup } from '../controllers/group';

interface Body {
  id: string;
}

const bodySchema = S.object().prop('id', S.string().required()).valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
  },
  preHandler: [preVerifySessionHandler],
};

export const assignDeleteGroupHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  const preVerifyAuthorizationHandler = createPreVerifyAuthorizationHandler(db);

  if (Array.isArray(opts.preHandler)) {
    opts.preHandler.push(preVerifyAuthorizationHandler);
  } else {
    opts.preHandler = preVerifyAuthorizationHandler;
  }

  server.delete(route, opts, async (request: Request, reply) => {
    let code = 200;
    const { id: groupId } = request.body as Body;

    try {
      if (!(await removeGroup(db, groupId))) {
        code = 400;
      }
    } catch (error) {
      console.error(error);
      code = 500;
    }

    reply.status(code).send();
  });
};
