import type { FastifyRequest, FastifyReply } from 'fastify';

import { verifyJwt } from '../utils/jwt';

export type Request<T = {}> = FastifyRequest<{
  Params: { userId: string } & T;
}>;

export const preVerifySessionHandler = async (
  request: Request,
  reply: FastifyReply
) => {
  const [, token] = request.headers?.cookie?.match(/login=([^;]+)(;|$)/) || [];

  do {
    if (!token) {
      reply.code(401).send({ status: 'error' });
      break;
    }

    const result = await verifyJwt(token);

    if (typeof result !== 'object' || result === null || !('id' in result)) {
      reply.code(400).send({ status: 'invalid' });
      break;
    }

    const { id: userId } = result as Record<string, unknown>;
    request.params.userId = String(userId);
  } while (false);
};
