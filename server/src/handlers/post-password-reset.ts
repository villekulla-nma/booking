import type { RouteShorthandOptions } from 'fastify';

import type { AssignHandlerFunction } from './type';
import { sendMail } from '../utils/send-mail';
import { env } from '../utils/env';
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

      server.log.debug('Setting reset token %s for user %s', token, user.id);

      await updateUser(db, user.id, { passwordReset: token });

      const link = `${env('APP_URL')}/password-reset/${token}`;
      const subject = 'Passwort-Reset';
      const text = `Moin ${user.firstName}.

Du hast einen Passwort-Reset angefordert. Klicke diesen Link um fortzufahren:

${link}

Solltest du den Passwort-Reset nicht angefordert haben, kannst du diese Email ignorieren.

MfG`;

      await sendMail(user.email, subject, text);
    } while (false);

    reply.send({ status: 'ok' });
  });
};
