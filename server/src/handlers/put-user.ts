import type { RouteShorthandOptions } from 'fastify';
import type { UserRole } from '@booking/types';
import S from 'fluent-json-schema';

import { STATUS } from '../constants';
import type { AssignHandlerFunction } from './type';
import type { Request } from './pre-verify-session';
import { preVerifySessionHandler } from './pre-verify-session';
import { createPreAuthorizeSessionHandler } from './create-pre-authorize-session';
import { getGroupById } from '../controllers/group';
import { createUser } from '../controllers/user';
import { defaultResponseSchema } from '../utils/schema';

interface Body {
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  groupId: string;
}

const bodySchema = S.object()
  .prop('role', S.oneOf([S.const('user'), S.const('admin')]).required())
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('groupId', S.string().required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: defaultResponseSchema,
  },
  preHandler: [preVerifySessionHandler],
};

export const assignPutUserHandler: AssignHandlerFunction = (
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
    const { role, email, firstName, lastName, groupId } = request.body as Body;
    const group = await getGroupById(db, groupId);

    do {
      if (group === null) {
        code = 400;
        response.status = STATUS.INVALID;
        break;
      }

      try {
        await createUser(db, role, email, firstName, lastName, groupId);
      } catch (error) {
        console.log(error);
        code = error.name === 'SequelizeValidationError' ? 400 : 500;
        response.status = code === 400 ? STATUS.INVALID : STATUS.ERROR;
      }
    } while (false); // eslint-disable-line no-constant-condition

    reply.status(code).send(response);
  });
};
