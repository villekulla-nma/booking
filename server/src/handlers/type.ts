import type { FastifyInstance } from 'fastify';
import type { AppModel } from '../model';

export type AssignHandlerFunction = (
  route: string,
  server: FastifyInstance,
  model: AppModel
) => void;
