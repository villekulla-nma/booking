import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import { randomBytes } from '../utils/crypto';
import { getUserByKey, updateUser } from '../controllers/user';

interface Body {
  email: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        password: { type: 'string' },
      },
    },
  },
};

export const assignPostPasswordResetHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.post(route, opts, async (request, reply) => {
    const { email } = request.body as Body;

    do {
      const user = await getUserByKey(db, 'email', email);

      if (!user) {
        break;
      }

      const token = randomBytes(32);

      server.log.warn('Setting reset token %s for user %s', token, user.id);

      await updateUser(db, user.id, { passwordReset: token });
    } while (false);

    reply.send({ status: 'ok' });
  });
};
