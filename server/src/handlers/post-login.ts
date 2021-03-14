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

const createLoginCookie = async (sub: string): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { sub },
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

      try {
        const user = await model.getUserByEmail(email);
        userId = user.id;
        hash = user.password;
      } catch {
        status = 401;
        result = { status: 'invalid' };
        break;
      }

      if (typeof userId === 'undefined' || typeof hash === 'undefined') {
        status = 400;
        result = { status: 'unverified' };
        break;
      }

      const passwordIsValid = await bcrypt.compare(password, hash);

      if (!passwordIsValid) {
        status = 401;
        result = { status: 'invalid' };
        break;
      }

      try {
        const cookie = await createLoginCookie(userId);
        reply.header('set-cookie', `login=${cookie}; path=/; httpOnly=true`);
      } catch (error) {
        console.log(error);
        status = 500;
        result = { status: 'error' };
      }
    } while (false);

    reply.status(status);
    reply.send(result);
  });
};
