import type { FastifyInstance } from 'fastify';
import type { Db } from '../db';

export type AssignHandlerFunction = (
  route: string,
  server: FastifyInstance,
  db: Db
) => void;
