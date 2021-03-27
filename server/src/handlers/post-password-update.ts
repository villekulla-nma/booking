import type {
  RouteShorthandOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import type { Db } from '../db';
import { hashPassword } from '../utils/crypto';
import type { AssignHandlerFunction } from './type';
import { getUserByKey, updateUser } from '../controllers/user';

interface Body {
  password: string;
  password_confirm: string;
}

interface Params {
  token: string;
  userId: string;
}

interface Request {
  Body: Body;
  Params: Params;
}

const opts: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        userId: { type: 'string' },
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        password: { type: 'string' },
        password_confirm: { type: 'string' },
      },
    },
  },
};

const createPreHandler = (db: Db) => async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply
) => {
  const { password, password_confirm: confirm } = request.body;

  if (password !== confirm) {
    reply.code(400).send({ status: 'invalid' });
    return;
  }

  const { token } = request.params;
  const user = await getUserByKey(db, 'passwordReset', token);

  // TODO: respond with status "expired"
  if (!user) {
    reply.code(400).send({ status: 'error' });
    return;
  }

  request.params.userId = user.id;
};

export const assignPostPasswordUpdateHandler: AssignHandlerFunction = (
  route,
  server,
  db
) => {
  opts.preHandler = createPreHandler(db);

  server.post<Request>(route, opts, async (request, reply) => {
    const { password } = request.body;
    const { userId } = request.params;
    const hash = await hashPassword(password);

    const succeeded = await updateUser(db, userId, {
      passwordReset: null,
      password: hash,
    });

    if (!succeeded) {
      reply.code(400).send({ status: 'error' });
      return;
    }

    reply.send({ status: 'ok' });
  });
};
