import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createPreAuthorizeSessionHandler } from './create-pre-authorize-session';
import { removeResource } from '../controllers/resource';

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

export const assignDeleteResourceHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  const preAuthorizeSessionHandler = createPreAuthorizeSessionHandler(db);

  if (Array.isArray(opts.preHandler)) {
    opts.preHandler.push(preAuthorizeSessionHandler);
  } else {
    opts.preHandler = preAuthorizeSessionHandler;
  }

  server.delete(route, opts, async (request: Request, reply) => {
    let code = 200;
    const { id: resourceId } = request.body as Body;

    try {
      if (!(await removeResource(db, resourceId))) {
        code = 400;
      }
    } catch (error) {
      console.error(error);
      code = 500;
    }

    reply.status(code).send();
  });
};
