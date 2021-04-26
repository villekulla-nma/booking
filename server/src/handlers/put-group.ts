import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import { STATUS } from '../constants';
import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createPreAuthorizeSessionHandler } from './create-pre-authorize-session';
import { createGroup } from '../controllers/group';
import { defaultResponseSchema } from '../utils/schema';

interface Body {
  name: string;
}

const bodySchema = S.object().prop('name', S.string().required()).valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: defaultResponseSchema,
  },
  preHandler: [preVerifySessionHandler],
};

export const assignPutGroupHandler: AssignHandlerFunction = (
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

  server.put(route, opts, async (request: Request, reply) => {
    let code = 200;
    const response = { status: STATUS.OK };
    const { name } = request.body as Body;

    try {
      await createGroup(db, name);
    } catch (error) {
      console.log(error);
      code = error.name === 'SequelizeValidationError' ? 400 : 500;
      response.status = code === 400 ? STATUS.INVALID : STATUS.ERROR;
    }

    reply.status(code).send(response);
  });
};
