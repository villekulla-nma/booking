import type { RouteShorthandOptions } from 'fastify';
import type { LoginResult } from '@villekulla-reservations/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import type { AssignHandlerFunction } from './type';

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

const createLoginCookie = async (userId: string): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '2 days' },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });

export const assignPostLoginHandler: AssignHandlerFunction = (
  route,
  server,
  model
) => {
  server.post(route, opts, async (request, reply) => {
    let status = 200;
    let result: { status: LoginResult } = { status: 'ok' };
    const { email, password } = request.body as Body;

    do {
      let userId: string | undefined;
      let hash: string | undefined;

      const user = await model.getUserByEmail(email);

      if (!user) {
        server.log.trace('Unknown user with email %s', email);
        status = 401;
        result = { status: 'invalid' };
        break;
      }

      if (typeof user.password === 'undefined') {
        server.log.trace('Unverified user with email %s', email);
        status = 400;
        result = { status: 'unverified' };
        break;
      }

      userId = user.id;
      hash = user.password;
      const passwordIsValid = await bcrypt.compare(password, hash);

      if (!passwordIsValid) {
        server.log.trace('Invalid password by user with email %s', email);
        status = 401;
        result = { status: 'invalid' };
        break;
      }

      try {
        const cookie = await createLoginCookie(userId);
        reply.header('set-cookie', `login=${cookie}; path=/; httpOnly=true`);
      } catch (error) {
        server.log.trace(
          'Error creating token: %s; user: %s',
          error.message,
          email
        );
        status = 500;
        result = { status: 'error' };
      }
    } while (false);

    reply.status(status);
    reply.send(result);
  });
};
