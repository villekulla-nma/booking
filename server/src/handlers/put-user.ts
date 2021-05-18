import type { RouteShorthandOptions } from 'fastify';
import type { UserRole } from '@booking/types';
import S from 'fluent-json-schema';

import { STATUS } from '../constants';
import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { preVerifyAuthorizationHandler } from './pre-verify-authorization';
import { getUnitById } from '../controllers/unit';
import { createUser } from '../controllers/user';
import { defaultResponseSchema } from '../utils/schema';

interface Body {
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  unitId: string;
}

const bodySchema = S.object()
  .prop('role', S.oneOf([S.const('user'), S.const('admin')]).required())
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('unitId', S.string().required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: defaultResponseSchema,
  },
  preHandler: [preVerifySessionHandler, preVerifyAuthorizationHandler],
};

export const assignPutUserHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.put(route, opts, async (request: Request, reply) => {
    let code = 200;
    const response = { status: STATUS.OK };
    const { role, email, firstName, lastName, unitId } = request.body as Body;
    const unit = await getUnitById(db, unitId);

    do {
      if (unit === null) {
        code = 400;
        response.status = STATUS.INVALID;
        break;
      }

      try {
        await createUser(db, role, email, firstName, lastName, unitId);
      } catch (error) {
        console.log(error);
        code = error.name === 'SequelizeValidationError' ? 400 : 500;
        response.status = code === 400 ? STATUS.INVALID : STATUS.ERROR;
      }
    } while (false); // eslint-disable-line no-constant-condition

    reply.status(code).send(response);
  });
};
