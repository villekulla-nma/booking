import type { FastifyRequest, FastifyReply } from 'fastify';

import { verifyJwt } from '../utils/jwt';
import { LOGOUT_COOKIE } from '../constants';

export type Request<T = Record<string, unknown>> = FastifyRequest<{
  Params: { userId: string } & T;
}>;

export const preVerifySessionHandler = async (
  request: Request,
  reply: FastifyReply
): Promise<void> => {
  const [, token] = request.headers?.cookie?.match(/login=([^;]+)(;|$)/) || [];

  if (!token) {
    reply.code(401).send({ status: 'error' });
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
      .send({ status: 'invalid' });
    return;
  }

  const { id: userId } = result as Record<string, unknown>;
  request.params.userId = String(userId);
};
