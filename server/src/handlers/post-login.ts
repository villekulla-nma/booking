import type { RouteShorthandOptions } from 'fastify';
import type { LoginResult } from '@booking/types';

import type { AssignHandlerFunction } from './type';
import { signJwt } from '../utils/jwt';
import { verifyPassword } from '../utils/crypto';
import { getUserByKey } from '../controllers/user';

interface Body {
  email: string;
  password: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  },
};

export const assignPostLoginHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.post(route, opts, async (request, reply) => {
    let status = 200;
    let result: { status: LoginResult } = { status: 'ok' };
    const { email, password } = request.body as Body;

    do {
      const user = await getUserByKey(db, 'email', email);

      if (!user) {
        server.log.trace('Unknown user with email %s', email);
        status = 401;
        result = { status: 'invalid' };
        break;
      }

      if (user.password === null) {
        server.log.trace('Unverified user with email %s', email);
        status = 400;
        result = { status: 'unverified' };
        break;
      }

      const userId = user.id;
      const hash = user.password;
      const passwordIsValid = await verifyPassword(password, hash);

      if (!passwordIsValid) {
        server.log.trace('Invalid password by user with email %s', email);
        status = 401;
        result = { status: 'invalid' };
        break;
      }

      try {
        const cookie = await signJwt({ id: userId });
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
        result = { status: 'error' };
      }
    } while (false); // eslint-disable-line no-constant-condition

    reply.status(status);
    reply.send(result);
  });
};
