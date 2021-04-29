import type { FastifyReply } from 'fastify';

import { STATUS } from '../constants';
import type { Request } from './pre-verify-session';

export const preVerifyAuthorizationHandler = async (
  request: Request,
  reply: FastifyReply
): Promise<void> => {
  const { role } = request.params;

  if (role !== 'admin') {
    reply.code(401).send({ status: STATUS.INVALID });
  }
};
