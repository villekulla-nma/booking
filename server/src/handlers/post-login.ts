import type { RouteShorthandOptions } from 'fastify';
import type { LoginResult } from '@booking/types';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { signJwt } from '../utils/jwt';
import { verifyPassword } from '../utils/crypto';
import { getUserByKey } from '../controllers/user';
import { defaultResponseSchema } from '../utils/schema';
import { STATUS } from '../constants';

interface Body {
  email: string;
  password: string;
}

const bodySchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('password', S.string().required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: defaultResponseSchema,
  },
};

export const assignPostLoginHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.post(route, opts, async (request, reply) => {
    let status = 200;
    let result: { status: LoginResult } = { status: STATUS.OK };
    const { email, password } = request.body as Body;

    do {
      const user = await getUserByKey(db, 'email', email);

      if (!user) {
        server.log.trace('Unknown user with email %s', email);
        status = 401;
        result = { status: STATUS.INVALID };
        break;
      }

      if (user.password === null) {
        server.log.trace('Unverified user with email %s', email);
        status = 400;
        result = { status: STATUS.UNVERIFIED };
        break;
      }

      const userId = user.id;
      const hash = user.password;
      const passwordIsValid = await verifyPassword(password, hash);

      if (!passwordIsValid) {
        server.log.trace('Invalid password by user with email %s', email);
        status = 401;
        result = { status: STATUS.INVALID };
        break;
      }

      try {
        const cookie = await signJwt({ id: userId, role: user.role });
        const expires = new Date();

        expires.setDate(expires.getDate() + 2);
        reply.header(
          'set-cookie',
          `login=${cookie}; expires=${expires.toUTCString()}; path=/; httpOnly=true`
        );
      } catch (error) {
        server.log.trace(
          'Error creating token: %s; user: %s',
          error.message,
          email
        );
        status = 500;
        result = { status: STATUS.ERROR };
      }
    } while (false); // eslint-disable-line no-constant-condition

    reply.status(status);
    reply.send(result);
  });
};
