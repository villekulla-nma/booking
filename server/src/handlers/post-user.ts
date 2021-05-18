import type { RouteShorthandOptions } from 'fastify';
import type { UserRole } from '@booking/types';
import S from 'fluent-json-schema';

import { STATUS } from '../constants';
import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { preVerifyAuthorizationHandler } from './pre-verify-authorization';
import { updateUser } from '../controllers/user';
import { defaultResponseSchema } from '../utils/schema';

interface Body {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  unitId: string;
}

const bodySchema = S.object()
  .prop('id', S.string().required())
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('email', S.string().required())
  .prop('role', S.oneOf([S.const('user'), S.const('admin')]).required())
  .prop('unitId', S.string().required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: defaultResponseSchema,
  },
  preHandler: [preVerifySessionHandler, preVerifyAuthorizationHandler],
};

export const assignPostUserHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.post(route, opts, async (request: Request, reply) => {
    let code = 200;
    const response = { status: STATUS.OK };
    const { id: resourceId, ...data } = request.body as Body;

    try {
      const succeeded = await updateUser(db, resourceId, data);

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
