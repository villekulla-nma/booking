import type {
  RouteShorthandOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import S from 'fluent-json-schema';

import type { Db } from '../db';
import { hashPassword } from '../utils/crypto';
import type { AssignHandlerFunction } from './type';
import { getUserByKey, updateUser } from '../controllers/user';
import { defaultResponseSchema } from '../utils/schema';
import { STATUS } from '../constants';

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

const paramsSchema = S.object()
  .prop('token', S.string().required())
  .prop('userId', S.string())
  .valueOf();

const bodySchema = S.object()
  .prop('password', S.string().minLength(8).required())
  .prop('password_confirm', S.string().minLength(8).required())
  .valueOf();

const opts: RouteShorthandOptions = {
  schema: {
    params: paramsSchema,
    body: bodySchema,
    response: defaultResponseSchema,
  },
};

const createPreHandler = (db: Db) => async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply
) => {
  const { password, password_confirm: confirm } = request.body;

  if (password !== confirm) {
    reply.code(400).send({ status: STATUS.INVALID });
    return;
  }

  const { token } = request.params;
  const user = await getUserByKey(db, 'passwordReset', token);

  // TODO: respond with status "expired"
  if (!user) {
    reply.code(400).send({ status: STATUS.ERROR });
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
      reply.code(400).send({ status: STATUS.ERROR });
      return;
    }

    reply.send({ status: STATUS.OK });
  });
};
