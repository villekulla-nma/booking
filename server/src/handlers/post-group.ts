import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import { STATUS } from '../constants';
import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { preVerifyAuthorizationHandler } from './pre-verify-authorization';
import { updateGroup } from '../controllers/group';
import { defaultResponseSchema } from '../utils/schema';

interface Body {
  id: string;
  name: string;
}

const bodySchema = S.object()
  .prop('id', S.string().required())
  .prop('name', S.string().required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: defaultResponseSchema,
  },
  preHandler: [preVerifySessionHandler, preVerifyAuthorizationHandler],
};

export const assignPostGroupHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.post(route, opts, async (request: Request, reply) => {
    let code = 200;
    const response = { status: STATUS.OK };
    const { id: groupId, name } = request.body as Body;

    try {
      const succeeded = await updateGroup(db, groupId, name);

      if (!succeeded) {
        code = 400;
        response.status = STATUS.ERROR;
      }
    } catch (error) {
      console.log('ERROR', error);
      code = error.name === 'SequelizeValidationError' ? 400 : 500;
      response.status = code === 400 ? STATUS.INVALID : STATUS.ERROR;
    }

    reply.status(code).send(response);
  });
};
