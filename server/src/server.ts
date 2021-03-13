import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import proxy from 'fastify-http-proxy';

const initProxy = (server: FastifyInstance): void => {
  if (typeof process.env.CLIENT_URL === 'string') {
    server.register(proxy, {
      upstream: process.env.CLIENT_URL,
      http2: false,
    });
  }
};

export const initServer = async (): Promise<void> => {
  const server = Fastify();

  server.get('/api', function (_, reply) {
    reply.send({ hello: 'world' });
  });

  await initProxy(server);
  await server.listen(process.env.PORT || '3000');
};
