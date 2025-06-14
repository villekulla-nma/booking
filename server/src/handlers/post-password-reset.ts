import type { RouteShorthandOptions } from 'fastify';
import { URL } from 'url';
import S from 'fluent-json-schema';

import type { AssignHandlerFunction } from './type';
import { randomBytes } from '../utils/crypto';
import { getUserByKey, updateUser } from '../controllers/user';
import { responseSchema200 } from '../utils/schema';
import { STATUS } from '../constants';
import { sendMail } from '../utils/send-mail';

interface Body {
  email: string;
  appUrl: string;
}

const bodySchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('appUrl', S.string().format(S.FORMATS.URI).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: { 200: responseSchema200 },
  },
};

const getEmailText = (
  userName: string,
  appUrl: string,
  token: string
): string => {
  const resetUrl = new URL(`/app/password-reset/${token}`, appUrl).toString();

  return `Moin ${userName},

du hast einen Passwort-Reset angefordert. Klicke dafür den folgenden Link und gib dein neues Passwort ein:

${resetUrl}

Solltest du den Passwort-Reset nicht angefordert haben, gib mir bitte Bescheid. Antworte dazu einfach auf diese Email.

LG`;
};

export const assignPostPasswordResetHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  server.post(route, opts, async (request, reply) => {
    const { email, appUrl } = request.body as Body;

    do {
      const user = await getUserByKey(db, 'email', email);

      if (!user) {
        break;
      }

      try {
        const token = randomBytes(32);
        const sendEmailPromise = sendMail({
          subject: 'Passwort-Reset',
          text: getEmailText(user.firstName, appUrl, token),
          to: user.email,
        });
        const updateUserPromise = updateUser(db, user.id, {
          passwordReset: token,
        });

        await Promise.all([sendEmailPromise, updateUserPromise]);

        server.log.info(
          'Password reset token "%s" for user "%s"',
          token,
          user.email
        );
      } catch (err) {
        server.log.error(err);
      }
    } while (false); // eslint-disable-line no-constant-condition

    reply.send({ status: STATUS.OK });
  });
};
