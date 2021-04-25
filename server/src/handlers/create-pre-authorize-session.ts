import type { FastifyReply } from 'fastify';

import type { Db } from '../db';
import { getUserById } from '../controllers/user';
import { STATUS } from '../constants';
import type { Request } from './pre-verify-session';

export const createPreAuthorizeSessionHandler = (db: Db) =>
  async function preAuthorizeSessionHandler(
    request: Request,
    reply: FastifyReply
  ): Promise<void> {
    const { userId } = request.params;
    const { role } = await getUserById(db, userId);

    if (role !== 'admin') {
      reply.code(401).send({ status: STATUS.INVALID });
      return;
    }
  };
