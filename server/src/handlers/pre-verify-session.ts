import type { FastifyRequest, FastifyReply } from 'fastify';

import { verifyJwt } from '../utils/jwt';
import { LOGOUT_COOKIE, STATUS } from '../constants';

export type Request<T = Record<string, unknown>> = FastifyRequest<{
  Params: { userId: string; role: string } & T;
}>;

export const preVerifySessionHandler = async (
  request: Request,
  reply: FastifyReply
): Promise<void> => {
  const [, token] = request.headers?.cookie?.match(/login=([^;]+)(;|$)/) || [];

  if (!token) {
    reply.code(401).send({ status: STATUS.ERROR });
    return;
  }

  let result = null;

  try {
    result = await verifyJwt(token);
  } catch {
    /* :shrug: */
  }

  if (typeof result !== 'object' || result === null || !('id' in result)) {
    reply
      .code(400)
      .header('set-cookie', LOGOUT_COOKIE)
      .send({ status: STATUS.INVALID });
    return;
  }

  const { id: userId, role } = result as Record<string, unknown>;
  request.params.userId = String(userId);
  request.params.role = String(role);
};
