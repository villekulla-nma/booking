import type { RouteShorthandOptions } from 'fastify';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { randomBytes } from '../utils/crypto';
import { getUserByKey, updateUser } from '../controllers/user';
import { responseSchema200 } from '../utils/schema';
import { STATUS } from '../constants';

interface Body {
  email: string;
}

const bodySchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: { 200: responseSchema200 },
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
    } while (false); // eslint-disable-line no-constant-condition

    reply.send({ status: STATUS.OK });
  });
};
